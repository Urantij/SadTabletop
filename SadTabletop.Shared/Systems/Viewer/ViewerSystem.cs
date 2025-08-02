using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Shared.Systems.Viewer;

public delegate IEntity ViewerTransform<in T>(T thing, Seat? target);

public class PointOfView(Type type, Delegate @delegate)
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
    private readonly List<PointOfView> _entities = new();
    private readonly List<PointOfView> _components = new();

    public ViewerSystem(Game game) : base(game)
    {
    }

    public IEntity View(IEntity entity, Seat? seat)
    {
        // Если есть трансформ, применить вернуть. Иначе просто вернуть

        PointOfView? transform = _entities.FirstOrDefault(v => v.Type == entity.GetType());

        if (transform == null)
            return entity;

        return (IEntity)transform.Delegate.DynamicInvoke(entity, seat);
    }

    public IComponent View(IComponent component, Seat? seat)
    {
        // Если есть трансформ, применить вернуть. Иначе просто вернуть

        PointOfView? transform = _components.FirstOrDefault(v => v.Type == component.GetType());

        if (transform == null)
            return component;

        return (IComponent)transform.Delegate.DynamicInvoke(component, seat);
    }

    public void RegisterEntity<T>(ViewerTransform<T> transform) where T : EntityBase
    {
        Add(transform, _entities);
    }

    public void RegisterComponent<T>(ViewerTransform<T> transform) where T : ClientComponentBase, IComponent
    {
        Add(transform, _components);
    }

    private void Add<T>(ViewerTransform<T> transform, List<PointOfView> list)
    {
        if (list.Any(o => o.Type == typeof(T)))
        {
            throw new Exception(
                $"Попытка добавить преобразователь для типа, который уже присутствует в коллекции типочков. {typeof(T).Name}");
        }

        list.Add(new PointOfView(typeof(T), transform));
    }
}