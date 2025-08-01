using System.Reflection;
using System.Runtime.Loader;

namespace SadTabletop.Server.Loading;

public class GameCodeLoader
{
    private const string DllsPath = "./Dlls";

    public static Assembly[] Do()
    {
        return Directory.GetFiles(DllsPath, "*.dll")
            .Select(path =>
            {
                Console.WriteLine($"грузим {path}");
                return AssemblyLoadContext.Default.LoadFromAssemblyPath(path);
            }).ToArray();
    }
}