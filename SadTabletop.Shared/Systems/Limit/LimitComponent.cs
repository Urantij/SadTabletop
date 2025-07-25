using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Shared.Systems.Limit;

/// <summary>
/// Хранит список тех, кому ентити ограничена.
/// </summary>
public class LimitComponent(object source, Spisok<Seat?> targets) : ComponentBase
{
    /// <summary>
    /// Источник ограничения.
    /// </summary>
    public object Source { get; } = source;

    /// <summary>
    /// Им нельзя что-то знать.
    /// </summary>
    public Spisok<Seat?> Targets { get; } = targets;
}