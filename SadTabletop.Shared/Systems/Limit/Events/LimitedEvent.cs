using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Shared.Systems.Limit.Events;

/// <summary>
/// Когда сущность изменяет свою ограниченность.
/// </summary>
public class LimitedEvent(
    EntityBase entity,
    IReadOnlyList<Seat?>? theyKnowNow = null,
    IReadOnlyList<Seat?>? theyDontKnowNow = null) : EventBase
{
    public EntityBase Entity { get; } = entity;
    public IReadOnlyList<Seat?>? TheyKnowNow { get; } = theyKnowNow;
    public IReadOnlyList<Seat?>? TheyDontKnowNow { get; } = theyDontKnowNow;
}