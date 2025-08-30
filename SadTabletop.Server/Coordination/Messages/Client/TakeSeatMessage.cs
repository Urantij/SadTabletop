namespace SadTabletop.Server.Coordination.Messages.Client;

/// <summary>
/// Клиент отправляет это сообщение, когда хочет занять место в игре.
/// </summary>
public class TakeSeatMessage(int? seatId) : AppClientMessageBase
{
    public int? SeatId { get; } = seatId;
}