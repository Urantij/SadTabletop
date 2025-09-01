namespace SadTabletop.Server.Coordination.Messages.Client;

public class ChangeNameMessage(string newName) : AppClientMessageBase
{
    public string NewName { get; } = newName;
}