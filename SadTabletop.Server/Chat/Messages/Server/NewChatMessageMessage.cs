using SadTabletop.Server.Coordination.Messages;
using SadTabletop.Shared.EvenMoreSystems.Chat;

namespace SadTabletop.Server.Chat.Messages.Server;

public class NewChatMessageMessage(string name, string color, EngineChatMessage content)
    : AppServerMessageBase
{
    public string Name { get; } = name;
    public string Color { get; } = color;

    public EngineChatMessage Content { get; } = content;
}