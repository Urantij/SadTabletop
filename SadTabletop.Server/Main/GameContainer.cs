using SadTabletop.Server.Chat;
using SadTabletop.Server.Coordination;
using SadTabletop.Server.Coordination.Data;
using SadTabletop.Server.Coordination.Messages.Server;
using SadTabletop.Shared;
using SadTabletop.Shared.EvenMoreSystems.Chat;
using SadTabletop.Shared.EvenMoreSystems.Drag;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Entities;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Synchro;
using SadTabletop.Shared.Systems.Times;

namespace SadTabletop.Server.Main;

public class GameContainer
{
    public Game Game { get; }
    public List<Player> Players { get; } = [];

    /// <summary>
    /// Локер игрового движка. Все действия должны происходит поочерёдно.
    /// </summary>
    public Lock Locker { get; } = new();

    public Connector Connector { get; }
    public Chatters Chat { get; }

    private int _nextPlayerId = 1;

    public GameContainer(Game game, Connector connector, Chatters chat)
    {
        Game = game;
        Connector = connector;
        Chat = chat;
    }

    public void Setup()
    {
        CommunicationSystem communication = Game.GetSystem<CommunicationSystem>();
        communication.CommunicationRequired += CommunicationOnCommunicationRequired;

        TimesSystem times = Game.GetSystem<TimesSystem>();
        times.DelayRequested += TimesOnDelayRequested;

        ChatSystem chat = Game.GetSystem<ChatSystem>();
        chat.ChatMessageSendRequested += ChatSendRequested;

        // TODO не забудь выключатель как нить
        Task.Run(() => CursorUpdateLoopAsync(default));

        GameCreator.TriggerSetupedGame(Game);
    }

    public void PlayerDisconnected(Player player)
    {
        if (player.Seat != null)
        {
            Game.GetSystem<DragSystem>().EndDrag(player.Seat, notify: false);
        }
    }

    private async Task CursorUpdateLoopAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(TimeSpan.FromMilliseconds(50), cancellationToken);
            }
            catch
            {
                return;
            }

            using var scope = Locker.EnterScope();

            // TODO сто проц как то можно не делать сто тыщ сериализаций. 
            // типа к ноде всё сериализовывать и потом раздавать...

            foreach (Player player in Players)
            {
                CursorsInfoMessage.CursorInfo[] cursors = Players
                    .Where(p => p != player)
                    .Where(p => p.Cursor.Changed)
                    .Select(p => new CursorsInfoMessage.CursorInfo(p.Id, p.Cursor.X, p.Cursor.Y))
                    .ToArray();

                if (cursors.Length == 0)
                    continue;

                CursorsInfoMessage message = new(cursors);

                Connector.QueueAppMessage(message, player.Client);
            }

            foreach (Player player in Players)
            {
                player.Cursor.Changed = false;
            }
        }
    }

    private void CommunicationOnCommunicationRequired(ServerMessageBase gameMessage, IReadOnlyList<Seat?> receivers)
    {
        // в теории, если есть способ запускать работу в гейме без внешнего вмешательства, тут нужен лок... ну возьму, пох тада
        // вообще если оно внутри чето делает, это уже проёб, так как снаружи оно всё ещё может зайти, пока внутри делается
        // так что тут локать не буду, всё равно смертельный вариант.

        // и ща ещё есть таймс. если и тут и там лочить, то будет дедлок от валв

        Connector.QueueGameMessage(gameMessage, receivers);
    }

    private void TimesOnDelayRequested(Delayed obj)
    {
        Task.Run(async () =>
        {
            try
            {
                await Task.Delay(obj.Delay, obj.Cancellation);
            }
            catch
            {
                return;
            }

            using Lock.Scope scope = Locker.EnterScope();

            Game.GetSystem<TimesSystem>().Execute(obj);
        });
    }

    private void ChatSendRequested(EngineChatMessage msg, IReadOnlyList<Seat>? targets)
    {
        ChatMessage chatMessage = new("системик", "gray", msg, targets?.Select(s => s.Id).ToArray());

        Chat.AddMessage(chatMessage);
    }

    public int GetNextPlayerId()
    {
        return _nextPlayerId++;
    }

    /// <summary>
    /// Держит в себе актуальные ссылки, нужно сразу сериализовывать.
    /// </summary>
    /// <param name="target"></param>
    /// <returns></returns>
    public ViewedEntity[] MakeSynchroContent(Seat? target)
    {
        SynchroSystem synchro = Game.GetSystem<SynchroSystem>();

        return Game.Systems.OfType<EntitiesSystem>()
            .Where(es => es.ClientSided)
            .SelectMany(es => synchro.ViewEntities(es, target))
            .ToArray();
    }

    public PlayerInfo[] MakePlayerInfo()
    {
        return Players.Select(p => new PlayerInfo(p.Id, p.Name, p.Seat?.Id)).ToArray();
    }
}