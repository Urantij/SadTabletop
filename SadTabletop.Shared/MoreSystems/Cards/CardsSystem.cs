using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards.Messages.Client;
using SadTabletop.Shared.MoreSystems.Cards.Messages.Server;
using SadTabletop.Shared.MoreSystems.Hands;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Communication.Events;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Limit;
using SadTabletop.Shared.Systems.Limit.Events;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Table;
using SadTabletop.Shared.Systems.Viewer;
using SadTabletop.Shared.Systems.Visability;

namespace SadTabletop.Shared.MoreSystems.Cards;

/// <summary>
/// Система для работы с картами.
/// </summary>
public class CardsSystem : SystemBase
{
    private readonly ViewerSystem _viewer;
    private readonly LimitSystem _limit;
    private readonly VisabilitySystem _visability;
    private readonly SeatsSystem _seats;
    private readonly TableSystem _table;
    private readonly EventsSystem _events;
    private readonly CommunicationSystem _communication;

    public CardsSystem(Game game) : base(game)
    {
    }

    protected internal override void GameCreated()
    {
        base.GameCreated();

        _events.Subscribe<LimitedEvent>(EventPriority.Normal, this, OnLimited);
        _events.Subscribe<ClientMessageReceivedEvent<FlipCardMessage>>(EventPriority.Normal, this, CardFlipRequested);
    }

    protected internal override void GameLoaded()
    {
        base.GameLoaded();

        _viewer.RegisterEntity<Card>(TransformCard);
    }

    public Card Create(float x, float y, CardFaceComplicated frontSide, CardFaceComplicated backSide,
        Flipness flipness, bool sendRelatedMessage = true)
    {
        Card card = new(frontSide, backSide)
        {
            Flipness = flipness,
            X = x,
            Y = y,
        };
        _table.AddEntity(card, sendRelatedMessage);

        return card;
    }

    public void Flip(Card card)
    {
        card.Flipness = card.Flipness switch
        {
            Flipness.Shown => Flipness.Hidden,
            Flipness.Hidden => Flipness.Shown,
            _ => throw new Exception("че бля")
        };

        AnnounceFlip(card);
    }

    /// <summary>
    /// Устанавливает указанный флип, и сообщает клиентам, если флип новый
    /// </summary>
    /// <param name="card"></param>
    /// <param name="flipness"></param>
    public void Flip(Card card, Flipness flipness)
    {
        if (card.Flipness == flipness)
            return;

        card.Flipness = flipness;

        AnnounceFlip(card);
    }

    /// <summary>
    /// Не обновляет информацию у клиентов, использовать только для работы с картами в деке.
    /// </summary>
    public void SetFlipness(Card card, Flipness flipness)
    {
        card.Flipness = flipness;
    }

    public bool CanFlip(Seat seat, Card card)
    {
        {
            CardFlipPermissionComponent? component = card.TryGetComponent<CardFlipPermissionComponent>();

            if (component != null)
            {
                if (component.TheyCan.Included(seat))
                    return true;
            }
        }

        {
            InHandComponent? component = card.TryGetComponent<InHandComponent>();

            if (component != null)
            {
                if (component.Hand.Owner == seat)
                    return true;
            }
        }

        return false;
    }

    private void AnnounceFlip(Card card)
    {
        if (card.Flipness == Flipness.Shown)
        {
            foreach (Seat? seat in _seats.EnumerateAllSeats())
            {
                CardFaceComplicated? front = _limit.IsLimitedFor(card, seat) ? null : card.Front;

                _communication.SendEntityRelated(new CardFlippedMessage(card, front), card, target: seat);
            }
        }
        else
        {
            _communication.SendEntityRelated(new CardFlippedMessage(card, null), card);
        }
    }

    private void CardFlipRequested(ClientMessageReceivedEvent<FlipCardMessage> @event)
    {
        if (@event.Seat == null || !CanFlip(@event.Seat, @event.Message.Card))
        {
            // TODO ошибка лог хызы
            return;
        }

        Flip(@event.Message.Card);
    }

    private void OnLimited(LimitedEvent obj)
    {
        if (obj.Entity is not Card card)
            return;

        if (card.Flipness == Flipness.Hidden)
            return;

        if (obj.TheyKnowNow != null)
        {
            _communication.SendEntityRelated(new CardInfoMessage(card, card.Front), card, obj.TheyKnowNow);
        }

        if (obj.TheyDontKnowNow != null)
        {
            _communication.SendEntityRelated(new CardInfoMessage(card, null), card, obj.TheyDontKnowNow);
        }
    }

    private CardDto TransformCard(Card card, Seat? seat)
    {
        bool revealFront = card.Flipness != Flipness.Hidden && !_limit.IsLimitedFor(card, seat);

        return new CardDto(card, revealFront);
    }
}