using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.EvenMoreSystems.Drag;

/// <summary>
/// Хранит предмет, который в данный момент тягается <see cref="Systems.Seats.Seat"/>
/// </summary>
/// <param name="item"></param>
public class DraggerComponent(TableItem item) : ClientComponentBase
{
    public TableItem? Item { get; internal set; } = item;
}