using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Events;

namespace SadTabletop.Shared.Systems.Entities.Events;

/// <summary>
/// Срабатывает, когда удаляется ентити в любой ентити системе.
/// </summary>
public class EntityRemovedEvent(EntityBase entity, EntitiesSystem system) : EventBase
{
    public EntityBase Entity { get; } = entity;
    public EntitiesSystem System { get; } = system;
}