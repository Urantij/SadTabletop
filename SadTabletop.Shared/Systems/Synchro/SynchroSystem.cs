using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Entities;
using SadTabletop.Shared.Systems.Entities.Events;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Synchro.Messages;
using SadTabletop.Shared.Systems.Viewer;
using SadTabletop.Shared.Systems.Visability;

namespace SadTabletop.Shared.Systems.Synchro;

// по итогу я передумал этим страдать, но оставлю уж

/// <summary>
/// Нужна отдельная система для синхронизации <see cref="EntityBase"/> из <see cref="EntitiesSystem{T}"/>
/// Поскольку синхронизация опирается и на <see cref="VisabilitySystem"/>, и на саму ентити систему.
/// И сам визабилити систем опирается на <see cref="SeatsSystem"/>, который ентити система...
/// Так что нужен третий актор, который сможет иметь в зависимости и ентитисистему, и визабилити.
/// И делать работу синхронизации.
/// Не отвечает за синхронизацию изменений ентити. Только для добавления и удаления.
/// </summary>
public class SynchroSystem : SystemBase
{
    private readonly EventsSystem _events;
    private readonly CommunicationSystem _communication;
    private readonly VisabilitySystem _visability;
    private readonly ViewerSystem _viewer;
    private readonly SeatsSystem _seats;

    public SynchroSystem(Game game) : base(game)
    {
        // TODO вообще зачем мне отправлять имя системы, если на клиенте по типу ентити можно определить систему?
    }

    public IEnumerable<ViewedEntity> ViewEntities(EntitiesSystem entitiesSystem, Seat? target)
    {
        if (!entitiesSystem.ClientSided)
            throw new Exception($"эта система не клиент сидед {entitiesSystem.GetType().Name}");

        return entitiesSystem.EnumerateRawEntities()
            .Where(e => _visability.IsVisibleFor(e, target))
            .Select(e => ViewEntity(e, target));
    }

    protected internal override void GameCreated()
    {
        base.GameCreated();

        _events.Subscribe<EntityAddedEvent>(EventPriority.Late, this, EntityAdded);
        _events.Subscribe<EntityRemovedEvent>(EventPriority.Late, this, EntityRemoved);
    }

    private void EntityAdded(EntityAddedEvent obj)
    {
        if (!obj.SendRelatedMessage)
            return;

        // TODO можно отправлять одно сообщение всем у кого вьювнутный ентити совпадает

        foreach (Seat? seat in _seats.EnumerateSeats())
        {
            ViewedEntity viewed = ViewEntity(obj.Entity, seat);
            _communication.Send(new EntityAddedMessage(viewed), seat);
        }
    }

    private void EntityRemoved(EntityRemovedEvent obj)
    {
        if (!obj.SendRelatedMessage)
            return;

        _communication.SendEntityRelated(new EntityRemovedMessage(obj.Entity), obj.Entity);
    }

    public ViewedEntity ViewEntity(EntityBase entity, Seat? target)
    {
        return new ViewedEntity(
            _viewer.View(entity, target),
            entity.ReadClientComponents()
                .Select(c => _viewer.View(c, target))
                .ToArray()
        );
    }
}