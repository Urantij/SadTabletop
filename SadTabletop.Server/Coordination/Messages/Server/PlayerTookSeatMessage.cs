namespace SadTabletop.Server.Coordination.Messages.Server;

/// <summary>
/// Клиент занял сидение
/// </summary>
public class PlayerTookSeatMessage(int playerId, int? seatId) : AppServerMessageBase
{
    public int PlayerId { get; } = playerId;
    public int? SeatId { get; } = seatId;
}