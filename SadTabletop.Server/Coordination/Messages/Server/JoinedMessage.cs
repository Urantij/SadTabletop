using SadTabletop.Server.Coordination.Data;
using SadTabletop.Shared.Systems.Synchro;

namespace SadTabletop.Server.Coordination.Messages.Server;

/// <summary>
/// Сообщает клиенту, что вход был успешен.
/// </summary>
public class JoinedMessage(int playerId, ICollection<ViewedEntity> entities, ICollection<PlayerInfo> players)
    : AppServerMessageBase
{
    public int PlayerId { get; } = playerId;
    public ICollection<ViewedEntity> Entities { get; } = entities;
    public ICollection<PlayerInfo> Players { get; } = players;
}