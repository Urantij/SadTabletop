using SadTabletop.Shared.EvenMoreSystems.Chat;

namespace SadTabletop.Server.Chat;

public class ChatMessageDto
{
    public string Name { get; }
    public string Color { get; }

    public EngineChatMessage Content { get; }

    public ChatMessageDto(ChatMessage chatMessage)
    {
        Name = chatMessage.Name;
        Color = chatMessage.Color;
        Content = chatMessage.Content;
    }
}