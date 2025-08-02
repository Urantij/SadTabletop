using System.Text.Json.Nodes;

namespace SadTabletop.Server.Coordination.Messages;

public class MessageContainer(string name, JsonNode content)
{
    public string Name { get; } = name;
    public JsonNode Content { get; } = content;
}