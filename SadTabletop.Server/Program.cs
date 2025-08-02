using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization.Metadata;
using SadTabletop.Server.Coordination;
using SadTabletop.Server.Loading;
using SadTabletop.Server.Main;
using SadTabletop.Server.Seri;
using SadTabletop.Server.Seri.Communication;
using SadTabletop.Shared;
using SadTabletop.Shared.Systems.Viewer;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

Assembly[] gameAssemblies = GameCodeLoader.Do();

var maanger = new GamesManager();

Game? game = GameDataLoader.TryLoadGame();

if (game == null)
{
    game = GameDataLoader.CreateGame(gameAssemblies);
    GameCreator.TriggerCreatedGame(game);
}

GameCreator.TriggerLoadedGame(game);

GameResolver gr = new(game);

WebSocketOptions webSocketOptions = new()
{
    KeepAliveInterval = TimeSpan.FromMinutes(1)
};

app.UseWebSockets(webSocketOptions);

var cm = new CommunicationModifer(gr);

JsonSerializerOptions options = new()
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    TypeInfoResolver = new DefaultJsonTypeInfoResolver()
    {
        Modifiers =
        {
            cm.Do
        }
    },
    Converters =
    {
        new AppServerMessageConverter(),
        new GameServerMessageConverter(),
        new SystemConverter(gr),
        new EntityConverter(gr, game.GetSystem<ViewerSystem>())
    }
};

ILoggerFactory loggerFactory = app.Services.GetRequiredService<ILoggerFactory>();

Connector connector = new(maanger, options, loggerFactory.CreateLogger<Connector>());

GameContainer container = new(game, connector);
container.Setup();

maanger.GameContainer = container;

// app.UseHttpsRedirection();

app.UseDefaultFiles();
app.UseStaticFiles();

// app.UseRouting()

app.Map("/ws", connector.AcceptWsConnection);

app.MapGet("/", () => "Hello World!");

app.MapFallbackToFile("index.html");

app.Run();