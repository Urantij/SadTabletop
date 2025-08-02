using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.Systems.Synchro.Messages;

/// <summary>
/// Сообщение о появлении новой сущности.
/// </summary>
public class EntityAddedMessage(ViewedEntity entity) : ServerMessageBase
{
    public ViewedEntity Entity { get; } = entity;
}