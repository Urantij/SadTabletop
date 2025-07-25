using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.Systems.Synchro.Messages;

/// <summary>
/// Сообщение об удалении сущности.
/// </summary>
public class EntityRemovedMessage(EntityBase entity) : ServerMessageBase
{
    public EntityBase Entity { get; } = entity;
}