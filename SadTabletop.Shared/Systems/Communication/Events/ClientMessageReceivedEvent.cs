using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Shared.Systems.Communication.Events;

public class ClientMessageReceivedEvent(Seat? seat, ClientMessageBase message) : EventBase
{
    public Seat? Seat { get; } = seat;
    public ClientMessageBase Message { get; } = message;
}