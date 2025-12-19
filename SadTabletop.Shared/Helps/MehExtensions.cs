namespace SadTabletop.Shared.Helps;

public static class MehExtensions
{
    // :) мне плохо
    public static int NonRepeatedRandomGet<T>(this IList<T> list, Func<T, int> get)
    {
        int sample;
        do
        {
            sample = Random.Shared.Next(int.MinValue, int.MaxValue);
        } while (!list.Select(get).Contains(sample));

        return sample;
    }

    public static void NonRepeatedRandom<T>(this IList<T> list, T item, Func<T, int> get, Action<T, int> set)
    {
        int sample = NonRepeatedRandomGet(list, get);

        set(item, sample);
    }

    public static void NonRepeatedRandomAssign<T>(this IList<T> list, Action<T, int> set)
    {
        int[] samples = list.Select(_ => Random.Shared.Next(int.MinValue, int.MaxValue)).ToArray();

        for (int i = 0; i < samples.Length; i++)
        {
            int sample = samples[i];

            if (samples.Skip(i).All(s => s != sample))
                continue;

            do
            {
                sample = Random.Shared.Next(int.MinValue, int.MaxValue);
            } while (!samples.Contains(sample));

            samples[i] = sample;
        }

        for (int i = 0; i < samples.Length; i++)
        {
            int sample = samples[i];
            T item = list[i];

            set(item, sample);
        }
    }
}