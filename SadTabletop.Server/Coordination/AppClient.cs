using System.Net.WebSockets;
using System.Text.Json.Nodes;
using SadTabletop.Server.Main;

namespace SadTabletop.Server.Coordination;

public class AppClient(WebSocket webSocket)
{
    public WebSocket WebSocket { get; } = webSocket;

    public Queue<JsonNode> SendQueue { get; } = new();
    public bool Sending { get; set; }

    // public Dictionary<string, object> Data { get; } = [];
    
    public Player? Player { get; set; }
    public GameContainer? GameContainer { get; set; }

    public bool Terminated { get; set; } = false;
}