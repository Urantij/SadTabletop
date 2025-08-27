using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Shared.Systems.Communication.Events;

public class ClientMessageReceivedEvent<T>(Seat? seat, T message) : EventBase
    where T : ClientMessageBase
{
    public Seat? Seat { get; } = seat;
    public T Message { get; } = message;
}

// public class ClientMessageReceivedEvent(Seat? seat, ClientMessageBase message) : EventBase
// {
//     public Seat? Seat { get; } = seat;
//     public ClientMessageBase Message { get; } = message;
// }