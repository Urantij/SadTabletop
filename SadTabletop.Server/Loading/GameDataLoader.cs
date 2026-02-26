using System.Reflection;
using SadTabletop.Server.Test;
using SadTabletop.Shared;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Dices;

namespace SadTabletop.Server.Loading;

public class GameDataLoader
{
    private const string DataPath = "./game.json";

    public static Game? TryLoadGame()
    {
        // if (File.Exists(DataPath))
        // {
        // }
        return null;
    }

    public static Game CreateGame(IReadOnlyCollection<Assembly> gameModules)
    {
        Func<Game, SystemBase>[] systemsFactories = gameModules.SelectMany(gm => gm.GetTypes())
            .Where(t => !t.IsAbstract)
            .Where(t => t.IsAssignableTo(typeof(SystemBase)))
            .Select<Type, Func<Game, SystemBase>>(t => (Game game) => (SystemBase)Activator.CreateInstance(t, game))
            .Append(game => new TestSystem(game))
            .Append(game => new AnotherTestSystem(game))
            .Append(game => new HandTestSystem(game))
            .Append(game => new PlayTestSystem(game))
            .Append(game => new DeckTestSystem(game))
            .Append(game => new DiceTestSystem(game))
            .Append(game => new FFATestSystem(game))
            .ToArray();

        return GameCreator.CreateBaseGame(new GameSetup(3, []), systemsFactories);
    }
}