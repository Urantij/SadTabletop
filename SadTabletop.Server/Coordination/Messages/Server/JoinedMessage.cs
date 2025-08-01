using SadTabletop.Server.Coordination.Data;

namespace SadTabletop.Server.Coordination.Messages.Server;

/// <summary>
/// Сообщает клиенту, что вход был успешен.
/// </summary>
public class JoinedMessage(ICollection<EntitiesInfo> entities, ICollection<PlayerInfo> players) : AppServerMessageBase
{
    public ICollection<EntitiesInfo> Entities { get; } = entities;
    public ICollection<PlayerInfo> Players { get; } = players;
}