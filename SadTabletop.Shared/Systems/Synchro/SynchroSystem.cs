using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Entities;
using SadTabletop.Shared.Systems.Entities.Events;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Synchro.Messages;
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

    public SynchroSystem(Game game) : base(game)
    {
    }

    protected internal override void GameCreated()
    {
        base.GameCreated();
        
        _events.Subscribe<EntityAddedEvent>(EventPriority.Late, this, EntityAdded);
        _events.Subscribe<EntityRemovedEvent>(EventPriority.Late, this, EntityRemoved);
    }

    private void EntityAdded(EntityAddedEvent obj)
    {
        _communication.SendEntityRelated(new EntityAddedMessage(obj.Entity), obj.Entity);
    }

    private void EntityRemoved(EntityRemovedEvent obj)
    {
        _communication.SendEntityRelated(new EntityRemovedMessage(obj.Entity), obj.Entity);
    }
}