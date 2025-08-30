using SadTabletop.Shared.Systems.Synchro;

namespace SadTabletop.Server.Coordination.Messages.Server;

/// <summary>
/// Клиент сменил стул. Нужно ему синхроинизровать всю игру..
/// </summary>
public class YouTookSeatMessage(int? seatId, ICollection<ViewedEntity> entities) : AppServerMessageBase
{
    public int? SeatId { get; } = seatId;
    public ICollection<ViewedEntity> Entities { get; } = entities;
}