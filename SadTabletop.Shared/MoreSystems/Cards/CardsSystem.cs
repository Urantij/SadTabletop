using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards.Messages;
using SadTabletop.Shared.Systems.Communication;
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
    }

    protected internal override void GameLoaded()
    {
        base.GameLoaded();

        _viewer.RegisterEntity<Card>(TransformCard);
    }

    public Card Create(float x, float y, int frontSide, int backSide, Flipness flipness, bool sendRelatedMessage = true)
    {
        Card card = new(backSide, frontSide)
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

        if (card.Flipness == Flipness.Shown)
        {
            foreach (Seat? seat in _seats.EnumerateSeats())
            {
                int? front = _limit.IsLimitedFor(card, seat) ? null : card.FrontSide;

                _communication.SendEntityRelated(new CardFlippedMessage(card, front), card);
            }
        }
        else
        {
            _communication.SendEntityRelated(new CardFlippedMessage(card, null), card);
        }
    }

    private void OnLimited(LimitedEvent obj)
    {
        if (obj.Entity is not Card card)
            return;

        if (card.Flipness == Flipness.Hidden)
            return;

        if (obj.TheyKnowNow != null)
        {
            _communication.SendEntityRelated(new CardInfoMessage(card, card.FrontSide), card, obj.TheyKnowNow);
        }

        if (obj.TheyDontKnowNow != null)
        {
            _communication.SendEntityRelated(new CardInfoMessage(card, null), card, obj.TheyDontKnowNow);
        }
    }

    private CardDto TransformCard(Card card, Seat? seat)
    {
        int? front;

        if (card.Flipness == Flipness.Hidden || _limit.IsLimitedFor(card, seat))
        {
            front = null;
        }
        else
        {
            front = card.FrontSide;
        }

        return new CardDto(card, front);
    }
}