using SadTabletop.Shared.Mechanics;

namespace SadTabletop.Shared;

/// <summary>
/// Основной класс игры, содержит в себе ссылки на все системы
/// </summary>
public class Game
{
    public List<SystemBase> Systems { get; } = [];

    public T GetSystem<T>() where T : SystemBase
    {
        return Systems.OfType<T>().First();
    }
}