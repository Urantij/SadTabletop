namespace SadTabletop.Server.Coordination.Messages.Client;

public class JoinMessage(string key, string name) : AppClientMessageBase
{
    public string Key { get; } = key;
    public string Name { get; } = name;
}