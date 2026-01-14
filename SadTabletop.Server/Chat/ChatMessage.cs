using SadTabletop.Shared.EvenMoreSystems.Chat;

namespace SadTabletop.Server.Chat;

/// <summary>
/// Информация о сообщении, которое было кем то кому то отправлено.
/// </summary>
public class ChatMessage
{
    public string Name { get; }
    public string Color { get; }

    public EngineChatMessage Content { get; }

    /// <summary>
    /// Айди стульев
    /// </summary>
    public IReadOnlyList<int>? Targets { get; }

    public ChatMessage(string name, string color, EngineChatMessage content, IReadOnlyList<int>? targets)
    {
        Name = name;
        Color = color;
        Content = content;
        Targets = targets;
    }
}