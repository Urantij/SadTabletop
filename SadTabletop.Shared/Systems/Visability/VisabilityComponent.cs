using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Shared.Systems.Visability;

/// <summary>
/// Регулирует видимость <see cref="EntityBase"/> для <see cref="Seat"/>
/// </summary>
public class VisabilityComponent(Spisok<Seat?> viewers) : ComponentBase
{
    public Spisok<Seat?> Viewers { get; init; } = viewers;
}