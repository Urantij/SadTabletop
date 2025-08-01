using System.Text.Json.Nodes;

namespace SadTabletop.Server.Seri.Communication;

public class MessageWrapper(string name, JsonNode content)
{
    public string Name { get; } = name;
    public JsonNode Content { get; } = content;
}