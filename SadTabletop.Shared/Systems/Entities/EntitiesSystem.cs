using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Entities.Events;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.Systems.Entities;

public abstract class EntitiesSystem : SystemBase
{
    protected EntitiesSystem(Game game) : base(game)
    {
    }
}

/// <summary>
/// Базовый класс для создания ентити-систем, которые хранят в себе ентити определённого толка.
/// <see cref="TableSystem"/>
/// </summary>
public abstract class EntitiesSystem<T> : EntitiesSystem
    where T : EntityBase
{
    protected int NextId = 1;

    protected readonly List<T> List = [];

    protected readonly EventsSystem Events;

    protected EntitiesSystem(Game game) : base(game)
    {
    }

    /// <summary>
    /// Добавляет энтити в список и рассказывает игрокам об этом.
    /// </summary>
    /// <param name="entity"></param>
    public void AddEntity(T entity)
    {
        entity.SetId(GenerateId());

        List.Add(entity);

        Events.Invoke(new EntityAddedEvent(entity, this));
    }

    public void RemoveEntity(T entity)
    {
        List.Remove(entity);

        Events.Invoke(new EntityRemovedEvent(entity, this));
    }

    /// <summary>
    /// Создаёт айди для новой ентити.
    /// Если айди просто растёт на 1 каждый раз, в теории это можно использовать, чтобы предугадывать скрытые от игроков действия.
    /// Ниче придумывать не буду, но вынес отдельно, мб в будущем захочу
    /// </summary>
    /// <returns></returns>
    private int GenerateId()
    {
        // сейм что и в компонент системе
        return NextId++;
    }
}