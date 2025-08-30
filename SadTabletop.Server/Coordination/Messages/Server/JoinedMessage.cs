using SadTabletop.Server.Coordination.Data;
using SadTabletop.Shared.Systems.Synchro;

namespace SadTabletop.Server.Coordination.Messages.Server;

/// <summary>
/// Сообщает клиенту, что вход был успешен.
/// </summary>
public class JoinedMessage(int? seatId, ICollection<ViewedEntity> entities, ICollection<PlayerInfo> players) : AppServerMessageBase
{
    public int? SeatId { get; } = seatId;
    public ICollection<ViewedEntity> Entities { get; } = entities;
    public ICollection<PlayerInfo> Players { get; } = players;
}