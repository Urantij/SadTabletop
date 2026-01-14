using SadTabletop.Shared.EvenMoreSystems.Chat;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Server.Chat;

/// <summary>
/// Менеджер. Менеджер. Менеджер.
/// </summary>
public class Chatters
{
    private readonly List<ChatMessage> _messages = [];

    private const int MsgListLimit = 200;

    public event Action<ChatMessage>? MessageAdded;

    public Chatters()
    {
    }

    public T[] CopyMessages<T>(Func<ChatMessage, bool> filter, Func<ChatMessage, T> transform)
    {
        lock (_messages)
        {
            return _messages.Where(filter).Select(transform).ToArray();
        }
    }

    public void AddMessage(ChatMessage message)
    {
        lock (_messages)
        {
            _messages.Add(message);

            if (_messages.Count > MsgListLimit)
            {
                _messages.RemoveAt(0);
            }
        }

        MessageAdded?.Invoke(message);
    }
}