using SadTabletop.Server.Coordination;
using SadTabletop.Server.Coordination.Data;
using SadTabletop.Shared;
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

    public Lock Locker { get; } = new();

    private readonly Connector _connector;

    private int _nextPlayerId = 1;

    public GameContainer(Game game, Connector connector)
    {
        Game = game;
        _connector = connector;
    }

    public void Setup()
    {
        CommunicationSystem communication = Game.GetSystem<CommunicationSystem>();
        communication.CommunicationRequired += CommunicationOnCommunicationRequired;

        TimesSystem times = Game.GetSystem<TimesSystem>();
        times.DelayRequested += TimesOnDelayRequested;

        GameCreator.TriggerSetupedGame(Game);
    }

    private void CommunicationOnCommunicationRequired(ServerMessageBase gameMessage, IReadOnlyList<Seat?> receivers)
    {
        // в теории, если есть способ запускать работу в гейме без внешнего вмешательства, тут нужен лок... ну возьму, пох тада
        // вообще если оно внутри чето делает, это уже проёб, так как снаружи оно всё ещё может зайти, пока внутри делается
        // так что тут локать не буду, всё равно смертельный вариант.

        // и ща ещё есть таймс. если и тут и там лочить, то будет дедлок от валв

        _connector.QueueGameMessage(gameMessage, receivers);
    }

    private void TimesOnDelayRequested(Delayed obj)
    {
        Task.Run(async () =>
        {
            await Task.Delay(obj.Delay);

            using Lock.Scope scope = Locker.EnterScope();

            Game.GetSystem<TimesSystem>().Execute(obj);
        });
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