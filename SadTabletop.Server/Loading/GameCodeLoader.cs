using System.Reflection;
using System.Runtime.Loader;
using SadTabletop.Shared;
using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Server.Loading;

public class GameCodeLoader
{
    private const string DllsPath = "./Dlls";

    public static Assembly[] Do()
    {
        if (!Directory.Exists(DllsPath))
        {
            Console.WriteLine("длл не читаем");
            return [];
        }

        return Directory.GetFiles(DllsPath, "*.dll")
            .Select(path =>
            {
                Console.WriteLine($"грузим {path}");
                return AssemblyLoadContext.Default.LoadFromAssemblyPath(path);
            }).ToArray();
    }

    public static Type[] GetClientMessages(IReadOnlyCollection<Assembly> assemblies)
    {
        return assemblies.Prepend(Assembly.GetAssembly(typeof(Game))).SelectMany(ass => ass.GetTypes())
            .Where(t => !t.IsAbstract && t.IsAssignableTo(typeof(ClientMessageBase)))
            .ToArray();
    }
}