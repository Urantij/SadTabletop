using System.Reflection;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Decks;
using SadTabletop.Shared.MoreSystems.Dices;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Limit;
using SadTabletop.Shared.Systems.MyRandom;
using SadTabletop.Shared.Systems.Runs;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Synchro;
using SadTabletop.Shared.Systems.Table;
using SadTabletop.Shared.Systems.Viewer;
using SadTabletop.Shared.Systems.Visability;

namespace SadTabletop.Shared;

public static class GameCreator
{
    public static Game CreateBaseGame(IEnumerable<Func<Game, SystemBase>> factories)
    {
        Game game = new();

        game.Systems.Add(new CommunicationSystem(game));
        game.Systems.Add(new EventsSystem(game));
        game.Systems.Add(new LimitSystem(game));
        game.Systems.Add(new RandomSystem(game));
        game.Systems.Add(new RunnerQueueSystem(game));
        game.Systems.Add(new SeatsSystem(game));
        game.Systems.Add(new SynchroSystem(game));
        game.Systems.Add(new TableSystem(game));
        game.Systems.Add(new ViewerSystem(game));
        game.Systems.Add(new VisabilitySystem(game));

        game.Systems.Add(new CardsSystem(game));
        game.Systems.Add(new DecksSystem(game));
        game.Systems.Add(new DicesSystem(game));

        game.Systems.Add(new MasterSystem(game));

        foreach (Func<Game, SystemBase> factory in factories)
        {
            game.Systems.Add(factory(game));
        }

        foreach (SystemBase gameSystem in game.Systems)
        {
            LinkSystem(game, gameSystem);
        }

        return game;
    }

    public static void TriggerCreatedGame(Game game)
    {
        game.Systems.ForEach(s => s.GameCreated());
    }

    public static void TriggerLoadedGame(Game game)
    {
        game.Systems.ForEach(s => s.GameLoaded());
    }

    static void LinkSystem(Game game, SystemBase system)
    {
        FieldInfo[] fields = system.GetType()
            .GetFields(BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.Public)
            .Where(f => f.FieldType.IsAssignableTo(typeof(SystemBase)))
            .ToArray();

        foreach (FieldInfo fieldInfo in fields)
        {
            Type targetSystemType = fieldInfo.FieldType;

            SystemBase targetSystem = game.Systems.First(s => s.GetType() == targetSystemType);

            fieldInfo.SetValue(system, targetSystem);
        }
    }
}