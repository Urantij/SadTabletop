using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Entities.Events;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.Systems.Entities;

public abstract class EntitiesSystem : SystemBase
{
    /// <summary>
    /// Отправляются ли ентити этой системы клиентам.
    /// </summary>
    public virtual bool ClientSided => true;

    protected EntitiesSystem(Game game) : base(game)
    {
    }

    public abstract IEnumerable<EntityBase> EnumerateRawEntities();

    public abstract EntityBase GetRawEntity(int id);
}

/// <summary>
/// Базовый класс для создания ентити-систем, которые хранят в себе ентити определённого толка.
/// У каждой ентити системы должны быть свой уникальный ентити в женерик типе.
/// <see cref="TableSystem"/>
/// </summary>
public abstract class EntitiesSystem<T> : EntitiesSystem
    where T : EntityBase
{
    // Бд не любит, когда у ентити айди 0.
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
    /// <param name="sendRelatedMessage">Если фолс, клиентам не будет отправлено сообщение о появлении этого ентити</param>
    public void AddEntity(T entity, bool sendRelatedMessage = true)
    {
        entity.SetId(GenerateId());

        List.Add(entity);

        Events.Invoke(new EntityAddedEvent(entity, this, sendRelatedMessage));
    }

    public void RemoveEntity(T entity, bool sendRelatedMessage = true)
    {
        List.Remove(entity);

        // И вот тут возникает вопрос. sendRelatedMessage класть в ивент, или мне нужно было руками вызывать прямо тут метод
        // но я не думал и думать не буду

        Events.Invoke(new EntityRemovedEvent(entity, this, sendRelatedMessage));
    }

    public T GetEntity(int id)
    {
        return List.First(e => e.Id == id);
    }

    public T? MaybeGetEntity(int id)
    {
        return List.FirstOrDefault(e => e.Id == id);
    }

    public override IEnumerable<EntityBase> EnumerateRawEntities()
    {
        return List;
    }

    public override EntityBase GetRawEntity(int id)
    {
        return GetEntity(id);
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