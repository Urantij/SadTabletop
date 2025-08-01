namespace SadTabletop.Server.Coordination.Data;

public class PlayerInfo(int id, string name, int? seatId)
{
    public int Id { get; } = id;
    public string Name { get; } = name;
    public int? SeatId { get; } = seatId;
}