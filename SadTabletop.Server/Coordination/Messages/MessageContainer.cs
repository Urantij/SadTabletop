using System.Text.Json.Nodes;

namespace SadTabletop.Server.Coordination.Messages;

public class MessageContainer(string messageName, JsonNode content)
{
    public string MessageName { get; } = messageName;
    public JsonNode Content { get; } = content;
}