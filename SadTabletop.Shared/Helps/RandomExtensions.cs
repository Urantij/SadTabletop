using System.Reflection;

namespace SadTabletop.Shared.Helps;

// https://stackoverflow.com/a/19513099
// TODO а оно уже не работает, увырге
public static class RandomExtensions
{
    public static int[] Save(this Random random)
    {
        // FieldInfo seedArrayInfo = typeof(Random).GetField("SeedArray",
        //     System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        // return seedArrayInfo.GetValue(random) as int[];
        return [];
    }

    public static void Restore(this Random random, int[] seedArray)
    {
        // FieldInfo seedArrayInfo = typeof(Random).GetField("SeedArray",
        //     System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        //
        // seedArrayInfo.SetValue(random, seedArray);
    }
}