using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Communication.Events;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Visability;

namespace SadTabletop.Shared.Systems.Communication;

/// <summary>
/// Система отвечает за отправку сообщений из игры клиентам, которые связаны с <see cref="Seats.Seat"/>
/// <see cref="CommunicationRequired"/> срабатывает, когда нужно доставить письмо сидению.
/// </summary>
public class CommunicationSystem : SystemBase
{
    private readonly SeatsSystem _seats;
    private readonly VisabilitySystem _visability;
    private readonly EventsSystem _events;

    public CommunicationSystem(Game game) : base(game)
    {
    }

    /// <summary>
    /// Требует отправить сообщение по местам. Коллекция целей принадлежит самой системе, за неё можно держаться
    /// </summary>
    public event Action<ServerMessageBase, IReadOnlyList<Seat?>>? CommunicationRequired;

    // наверное, стоит вынести отсюда?
    public void Receive(Seat? seat, ClientMessageBase message)
    {
        // уу рефлексия... но есть один варик с кодогенерацией канеш, если в каждое сообщение сделать партиал и добавить создание ивента
        Type targetEventType = typeof(ClientMessageReceivedEvent<>).MakeGenericType(message.GetType());
        EventBase ev = (EventBase)Activator.CreateInstance(targetEventType, seat, message);

        _events.Invoke(ev);
    }

    public void Send(ServerMessageBase message, Spisok<Seat?> spisok)
    {
        IEnumerable<Seat?> targets = _seats.EnumerateAllSeats().Where(spisok.Included);

        Send(message, targets);
    }

    public void Send(ServerMessageBase message, Seat? target)
    {
        Send(message, [target]);
    }

    public void Send(ServerMessageBase message, IEnumerable<Seat?> targets)
    {
        Seat?[] toSend = targets.ToArray();

        CommunicationRequired?.Invoke(message, toSend);
    }

    /// <summary>
    /// Отправляет сообщение всем тем, кто может видеть ентити
    /// </summary>
    /// <param name="message"></param>
    /// <param name="entity"></param>
    public void SendEntityRelated(ServerMessageBase message, EntityBase entity)
    {
        IEnumerable<Seat?> targets = _seats.EnumerateAllSeats().Where(s => _visability.IsVisibleFor(entity, s));

        Send(message, targets);
    }

    public void SendEntityRelated(ServerMessageBase message, EntityBase entity, IEnumerable<Seat?> targets)
    {
        targets = targets.Where(s => _visability.IsVisibleFor(entity, s));

        Send(message, targets);
    }

    public void SendEntityRelated(ServerMessageBase message, EntityBase entity, Seat? target)
    {
        // да можно сделать нормально TODO

        SendEntityRelated(message, entity, [target]);
    }
}