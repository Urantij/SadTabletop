using SadTabletop.Server.Coordination;
using SadTabletop.Server.Coordination.Data;
using SadTabletop.Shared;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Entities;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Viewer;
using SadTabletop.Shared.Systems.Visability;

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
    }

    private void CommunicationOnCommunicationRequired(ServerMessageBase gameMessage, IReadOnlyList<Seat?> receivers)
    {
        // в теории, если есть способ запускать работу в гейме без внешнего вмешательства, тут нужен лок... ну возьму, пох тада
        // вообще если оно внутри чето делает, это уже проёб, так как снаружи оно всё ещё может зайти, пока внутри делается
        // так что тут локать не буду, всё равно смертельный вариант.

        _connector.QueueGameMessage(gameMessage, receivers);
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
    public EntitiesInfo[] MakeSynchroContent(Seat? target)
    {
        VisabilitySystem visability = Game.GetSystem<VisabilitySystem>();
    
        return Game.Systems.OfType<EntitiesSystem>()
            .Where(s => s.ClientSided)
            .Select(s =>
            {
                IEntity[] ens = s.EnumerateRawEntities()
                    .Where(e => visability.IsVisibleFor(e, target))
                    .ToArray<IEntity>();
    
                return new EntitiesInfo(s, ens);
            })
            .Where(c => c.Entities.Count > 0)
            .ToArray();
    }

    public PlayerInfo[] MakePlayerInfo()
    {
        return Players.Select(p => new PlayerInfo(p.Id, p.Name, p.Seat?.Id)).ToArray();
    }
}