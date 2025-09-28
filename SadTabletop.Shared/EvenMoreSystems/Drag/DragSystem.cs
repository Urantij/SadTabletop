using SadTabletop.Shared.EvenMoreSystems.Drag.Messages.Client;
using SadTabletop.Shared.EvenMoreSystems.Drag.Messages.Server;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Hands;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Communication.Events;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.EvenMoreSystems.Drag;

public class DragSystem : ComponentSystemBase
{
    private readonly CommunicationSystem _communication;
    private readonly SeatsSystem _seats;

    public DragSystem(Game game) : base(game)
    {
    }

    protected internal override void GameCreated()
    {
        base.GameCreated();

        Game.GetSystem<EventsSystem>().Subscribe<ClientMessageReceivedEvent<StartDragMessage>>(EventPriority.Normal, this, DragStarted);
        Game.GetSystem<EventsSystem>().Subscribe<ClientMessageReceivedEvent<EndDragMessage>>(EventPriority.Normal, this, DragEnded);
    }

    /// <summary>
    /// Принудительно заканчивает драг
    /// </summary>
    /// <param name="seat"></param>
    /// <param name="notify">Отправлять ли пакетик всем об этом</param>
    /// <returns>Тру, если было и убрал</returns>
    public bool EndDrag(Seat seat, bool notify = true)
    {
        DraggerComponent? component = seat.TryGetComponent<DraggerComponent>();

        if (component?.Item == null)
        {
            return false;
        }

        if (notify)
        {
            DragEndedMessage message = new(seat);
            _communication.Send(message);
        }

        component.Item = null;

        return true;
    }

    public bool CanDrag(Seat seat, TableItem item)
    {
        if (item is Card card)
        {
            InHandComponent? inHand = card.TryGetComponent<InHandComponent>();

            if (inHand?.Hand.Owner == seat)
            {
                return true;
            }
        }

        return false;
    }

    private void DragStarted(ClientMessageReceivedEvent<StartDragMessage> @event)
    {
        if (@event.Seat == null)
        {
            // TODO ошибка
            return;
        }

        DraggerComponent? component = @event.Seat.TryGetComponent<DraggerComponent>();

        if (component?.Item != null)
        {
            // TODO ошибка наверное
            return;
        }

        if (!CanDrag(@event.Seat, @event.Message.Item))
        {
            // TODO ошибка
            return;
        }

        if (component == null)
        {
            component = new DraggerComponent(@event.Message.Item);
            AddComponentToEntity(@event.Seat, component);
        }
        else
        {
            component.Item = @event.Message.Item;
        }

        DragStartedMessage message = new(@event.Seat, @event.Message.Item);

        _communication.SendEntityRelated(message, message.Item, targets: _seats.EnumerateAllSeats().Where(s => s != @event.Seat));
    }

    private void DragEnded(ClientMessageReceivedEvent<EndDragMessage> @event)
    {
        if (@event.Seat == null)
        {
            // TODO ошибка
            return;
        }

        DraggerComponent? component = @event.Seat.TryGetComponent<DraggerComponent>();

        if (component?.Item == null)
        {
            // TODO ошибка наверное
            return;
        }

        DragEndedMessage message = new(@event.Seat);
        _communication.Send(message, targets: _seats.EnumerateAllSeats().Where(s => s != @event.Seat));

        component.Item = null;
    }
}