using System.Net;
using System.Net.WebSockets;
using System.Text.Json;
using System.Text.Json.Nodes;
using SadTabletop.Server.Coordination.Data;
using SadTabletop.Server.Coordination.Messages;
using SadTabletop.Server.Coordination.Messages.Client;
using SadTabletop.Server.Coordination.Messages.Server;
using SadTabletop.Server.Main;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Synchro;

namespace SadTabletop.Server.Coordination;

/// <summary>
/// Принимает вебсокет соединения и хранит их.
/// Также позволяет отправлять сообщения по соединению.
/// </summary>
public class Connector
{
    private readonly List<AppClient> _clients = [];

    private readonly GamesManager _gamesManager;
    private readonly JsonSerializerOptions _serializerOptions;
    private readonly ILogger _logger;

    private readonly IReadOnlyDictionary<string, Type> _clientMessageTypes;

    public Connector(GamesManager gamesManager, JsonSerializerOptions serializerOptions,
        IReadOnlyCollection<Type> gameClientMessagesTypes, ILogger<Connector> logger)
    {
        _gamesManager = gamesManager;
        _serializerOptions = serializerOptions;
        _logger = logger;

        _clientMessageTypes = gameClientMessagesTypes.ToDictionary(t => t.Name, t => t);
    }

    public void QueueMessage(AppClient client, JsonNode message)
    {
        lock (client.SendQueue)
        {
            client.SendQueue.Enqueue(message);

            if (client.Sending)
                return;

            client.Sending = true;
        }

        Task.Run(() => SendingLoopAsync(client));
    }

    private async Task SendingLoopAsync(AppClient client, CancellationToken cancellation = default)
    {
        while (client.WebSocket.State == WebSocketState.Open)
        {
            JsonNode? message;

            lock (client.SendQueue)
            {
                if (!client.SendQueue.TryDequeue(out message))
                {
                    client.Sending = false;
                    return;
                }
            }

            byte[] content = JsonSerializer.SerializeToUtf8Bytes(message, _serializerOptions);

            try
            {
                await client.WebSocket.SendAsync(content, WebSocketMessageType.Text, true, cancellation);
            }
            catch (Exception e)
            {
                _logger.LogWarning(e, "Сенд провалился");
            }
        }
    }

    public void QueueGameMessage(ServerMessageBase gameMessage, IReadOnlyList<Seat?> receivers)
    {
        // TODO лок

        // сериализация игрового сообщения должна быть в локе тоже

        JsonNode result = SerializeMessage(gameMessage);

        foreach (AppClient client in _clients.Where(c => receivers.Contains(c.Player?.Seat)))
        {
            QueueMessage(client, result);
        }
    }

    public async Task AcceptWsConnection(HttpContext context)
    {
        CancellationToken cancellation = default;

        if (context.WebSockets.IsWebSocketRequest)
        {
            WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();

            AppClient appClient = new(webSocket);

            lock (_clients)
            {
                _clients.Add(appClient);
            }

            byte[] buffer = new byte[1024 * 4];

            try
            {
                while (webSocket.State == WebSocketState.Open)
                {
                    Memory<byte> subBuffer = await ReadMessageAsync(webSocket, buffer, cancellation);

                    if (subBuffer.Length == 0)
                        return;

                    JsonNode? node = JsonNode.Parse(subBuffer.Span);

                    if (node == null)
                        return;

                    MessageContainer container = JsonSerializer.Deserialize<MessageContainer>(node, _serializerOptions);

                    ReadContainer(appClient, container);
                }
            }
            finally
            {
                Terminate(appClient);
            }
        }
        else
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
        }
    }

    private void ReadContainer(AppClient appClient, MessageContainer container)
    {
        if (container.Name == nameof(JoinMessage))
        {
            JoinMessage message = JsonSerializer.Deserialize<JoinMessage>(container.Content, _serializerOptions);

            JoinMessageReceived(appClient, message);
        }
        else if (container.Name == nameof(RegisterMessage))
        {
        }
        else if (_clientMessageTypes.TryGetValue(container.Name, out Type? messageType))
        {
            if (appClient.GameContainer == null)
            {
                // TODO хммм
                return;
            }

            ClientMessageBase? message =
                JsonSerializer.Deserialize(container.Content, messageType, _serializerOptions) as ClientMessageBase;

            if (message == null)
            {
                // TODO хммм
                return;
            }

            appClient.GameContainer.Game.GetSystem<CommunicationSystem>().Receive(appClient.Player.Seat, message);
        }
        else
        {
            // TODO хммм
        }
    }

    private void JoinMessageReceived(AppClient appClient, JoinMessage message)
    {
        if (appClient.Player != null)
        {
            Terminate(appClient);
            return;
        }

        GameContainer gameContainer = _gamesManager.GetCurrentContainer();

        using Lock.Scope scope = gameContainer.Locker.EnterScope();

        string name = message.Name;

        int? targetSeatId = null;
        if (targetSeatId != null)
        {
            if (gameContainer.Players.Any(p => p.Seat?.Id == targetSeatId))
            {
                targetSeatId = null;
            }
        }

        Seat? seat = null;
        if (targetSeatId != null)
        {
            seat = gameContainer.Game.GetSystem<SeatsSystem>().GetEntity(targetSeatId.Value);
        }

        ViewedEntity[] content = gameContainer.MakeSynchroContent(seat);
        PlayerInfo[] pInfos = gameContainer.MakePlayerInfo();

        Player player = new(gameContainer.GetNextPlayerId(), name, appClient, seat);
        gameContainer.Players.Add(player);

        appClient.Player = player;
        appClient.GameContainer = gameContainer;

        JoinedMessage response = new(content, pInfos);

        PlayerJoinedMessage playerJoinedMessage = new(player.Id, player.Name, player.Seat?.Id);
        JsonNode joinedSerialized = SerializeMessage(playerJoinedMessage);

        foreach (Player otherPlayer in gameContainer.Players.Where(otherPlayer => otherPlayer != player))
        {
            QueueMessage(otherPlayer.Client, joinedSerialized);
        }

        QueueMessage(appClient, SerializeMessage(response));
    }

    /// <summary>
    /// Обрывает соединение с клиентом и удаляет его из списка игроков.
    /// </summary>
    /// <param name="client"></param>
    private void Terminate(AppClient client)
    {
        lock (client)
        {
            if (client.Terminated)
                return;

            client.Terminated = true;
        }

        // Никакой документации, описании. Оно ексепшены кидает? мейби
        client.WebSocket.Abort();

        if (client.Player == null)
        {
            return;
        }

        using Lock.Scope scope = client.GameContainer.Locker.EnterScope();

        client.GameContainer.Players.Remove(client.Player);

        if (client.GameContainer.Players.Count == 0)
            return;

        PlayerLeftMessage message = new(client.Player.Id);
        JsonNode serializedMessage = SerializeMessage(message);

        foreach (Player otherPlayer in client.GameContainer.Players)
        {
            QueueMessage(otherPlayer.Client, serializedMessage);
        }
    }

    private JsonNode SerializeMessage(ServerMessageBase message)
    {
        return JsonSerializer.SerializeToNode(message, _serializerOptions);
    }

    private JsonNode SerializeMessage(AppServerMessageBase message)
    {
        return JsonSerializer.SerializeToNode(message, _serializerOptions);
    }

    private async Task<Memory<byte>> ReadMessageAsync(WebSocket webSocket, Memory<byte> buffer,
        CancellationToken cancellation = default)
    {
        // Никакой инфы по тому как работает рисив тупа нет. Везде тока один пример и всё.
        // Здорово.

        ValueWebSocketReceiveResult result = await webSocket.ReceiveAsync(buffer, cancellation);

        // а я ноль идей вообще как это всё работает.

        Memory<byte> messageBuffer = buffer.Slice(0, result.Count);

        return messageBuffer;
    }
}