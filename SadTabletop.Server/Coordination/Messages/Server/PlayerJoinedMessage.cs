namespace SadTabletop.Server.Coordination.Messages.Server;

public class PlayerJoinedMessage(int id, string name, int? seatId) : AppServerMessageBase
{
    public int Id { get; } = id;
    public string Name { get; } = name;
    public int? SeatId { get; } = seatId;
}