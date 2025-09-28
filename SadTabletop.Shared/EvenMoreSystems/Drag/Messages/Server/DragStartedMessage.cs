using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.EvenMoreSystems.Drag.Messages.Server;

public class DragStartedMessage(Seat seat, TableItem item) : ServerMessageBase
{
    public Seat Seat { get; } = seat;
    public TableItem Item { get; } = item;
}