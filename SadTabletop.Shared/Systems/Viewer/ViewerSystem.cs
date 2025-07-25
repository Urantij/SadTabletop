using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Shared.Systems.Viewer;

public delegate object? ViewerTransform<in T>(T thing, Seat? target);

public class ViewerOne(Type type, Delegate @delegate)
{
    public Type Type { get; } = type;
    public Delegate Delegate { get; } = @delegate;
}

/// <summary>
/// Когда внешнему миру нужно превратить модель сервера в модель для клиента, он обращается сюда.
/// Системы, ответственные за свои сущности, регистрируют трансформы здесь.
/// </summary>
public class ViewerSystem : SystemBase
{
    // TODO наверное не надо инклуд, пусть системы каждый раз регают, но нужно это как то вынести в описание.
    private readonly List<ViewerOne> _ones = new();

    public ViewerSystem(Game game) : base(game)
    {
    }

    public void RegisterEntity<T>(ViewerTransform<T> transform) where T : EntityBase
    {
        Add(transform);
    }

    public void RegisterComponent<T>(ViewerTransform<T> transform) where T : ClientComponentBase
    {
        Add(transform);
    }

    private void Add<T>(ViewerTransform<T> transform)
    {
        if (_ones.Any(o => o.Type == typeof(T)))
        {
            throw new Exception(
                $"Попытка добавить преобразователь для типа, который уже присутствует в коллекции типочков. {typeof(T).Name}");
        }

        _ones.Add(new ViewerOne(typeof(T), transform));
    }

    public ViewerOne[] GetOnes()
        => _ones.ToArray();
}