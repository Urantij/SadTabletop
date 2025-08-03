using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.Systems.Clicks;

/// <summary>
/// Произошедший клик.
/// </summary>
public class Click(Seat? seat, TableItem item, ClickComponent component)
{
    public Seat? Seat { get; } = seat;
    public TableItem Item { get; } = item;
    public ClickComponent Component { get; } = component;
}