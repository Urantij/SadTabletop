using SadTabletop.Server.Coordination.Messages;

namespace SadTabletop.Server.Chat.Messages.Client;

public class SendChatMessageMessage(string content) : AppClientMessageBase
{
    public string Content { get; } = content;
}