using System.Reflection;
using SadTabletop.Shared;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Entities;

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
            .ToArray();

        return GameCreator.CreateBaseGame(systemsFactories);
    }
}