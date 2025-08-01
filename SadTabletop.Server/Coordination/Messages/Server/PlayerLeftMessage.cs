namespace SadTabletop.Server.Coordination.Messages.Server;

public class PlayerLeftMessage(int id) : AppServerMessageBase
{
    public int Id { get; } = id;
}