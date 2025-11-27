using SadTabletop.Shared.Mechanics;

namespace SadTabletop.Shared;

/// <summary>
/// Основной класс игры, содержит в себе ссылки на все системы
/// </summary>
public class Game(GameSetup setup)
{
    public GameSetup Setup { get; } = setup;

    public List<SystemBase> Systems { get; } = [];

    // TODO сериализовать
    // В теории айди не должны повторяться только для ентити, так как ентити айди я всё равно юзаю для линка.
    // Но это сложнее сделать, а смысла не сильно больше.
    private int _nextComponentId = 1;

    public T GetSystem<T>() where T : SystemBase
    {
        return Systems.OfType<T>().First();
    }

    internal int GetNextComponentId()
    {
        return _nextComponentId++;
    }
}