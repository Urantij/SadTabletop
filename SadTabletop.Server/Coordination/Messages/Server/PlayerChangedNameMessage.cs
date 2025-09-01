namespace SadTabletop.Server.Coordination.Messages.Server;

public class PlayerChangedNameMessage(int playerId, string newName) : AppServerMessageBase
{
    public int PlayerId { get; } = playerId;
    public string NewName { get; } = newName;
}