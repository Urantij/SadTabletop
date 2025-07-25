using SadTabletop.Shared.Helps;
using SadTabletop.Shared.Mechanics;

namespace SadTabletop.Shared.Systems.MyRandom;

/// <summary>
/// Хранит в себе зерно и текущий стейт рандома, чтобы рандом был менее рандомным. Чтобы рандом можно было сохранять...
/// </summary>
public class RandomSystem : SystemBase
{
    // TODO сериализация
    private int seed;
    private int[] state;

    private Random random;

    public RandomSystem(Game game) : base(game)
    {
    }

    protected internal override void GameCreated()
    {
        base.GameCreated();

        seed = GenerateSeed();
        random = new Random(seed);
        // кстати хызы, мож он референс не меняет, и я могу не брать его каждый раз ниже
        state = random.Save();
    }

    protected internal override void GameLoaded()
    {
        base.GameLoaded();

        random = new Random(seed);
        random.Restore(state);
    }

    /// <summary>
    /// [min, max)
    /// </summary>
    /// <param name="min"></param>
    /// <param name="max"></param>
    /// <returns></returns>
    public int Get(int min, int max)
    {
        int result = random.Next(min, max);

        state = random.Save();

        return result;
    }

    // public T FromCollection<T>(IReadOnlyList<T> collection)
    // {
    //     
    // }

    /// <summary>
    /// Пересоздаёт рандом с новым случайным сидом. не знаю зачем.
    /// </summary>
    public void Fuckup()
    {
        seed = GenerateSeed();
        random = new Random(seed);
        state = random.Save();
    }

    private int GenerateSeed()
    {
        return Random.Shared.Next();
    }
}