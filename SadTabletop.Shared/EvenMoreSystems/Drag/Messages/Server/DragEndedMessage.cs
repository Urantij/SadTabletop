using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Shared.EvenMoreSystems.Drag.Messages.Server;

public class DragEndedMessage(Seat seat) : ServerMessageBase
{
    public Seat Seat { get; } = seat;
}