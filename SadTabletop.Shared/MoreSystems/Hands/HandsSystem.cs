using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Hands.Messages.Server;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Limit;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.MoreSystems.Hands;

public class HandsSystem : ComponentSystemBase
{
    private readonly CommunicationSystem _communication;
    private readonly LimitSystem _limit;

    // TODO searialize
    private readonly List<Hand> _hands = [];

    public HandsSystem(Game game) : base(game)
    {
    }

    protected internal override void GameLoaded()
    {
        base.GameLoaded();

        Game.GetSystem<ViewerSystem>().RegisterComponent<InHandComponent>(TransformInHand);
    }

    public Hand GetHand(Seat seat)
    {
        // TODO по хорошему руку сразу создавать на все ситы надо. но это нужно ловить ивенты, тырыпыры
        // мне лень
        // а может и нет...
        Hand? hand = _hands.FirstOrDefault(h => h.Owner == seat);
        if (hand == null)
        {
            hand = new Hand(seat);
            _hands.Add(hand);
        }

        return hand;
    }

    /// <summary>
    /// Предполагается юзать один раз при создании игры, так что повторные юзы или юзы в игре не обработаны.
    /// </summary>
    /// <param name="seat"></param>
    /// <param name="x"></param>
    /// <param name="y"></param>
    /// <param name="rotation"></param>
    public void ModifyHand(Seat seat, int? x = null, int? y = null, float? rotation = null)
    {
        HandOverrideComponent handOverride = new(x, y, rotation);
        AddComponentToEntity(seat, handOverride);
    }

    public void AddToHand(Card card, Seat seat, int index)
    {
        // TODO по хорошему руку сразу создавать на все ситы надо. но это нужно ловить ивенты, тырыпыры
        // мне лень
        // а может и нет...
        Hand hand = GetHand(seat);

        InHandComponent? inHand = card.TryGetComponent<InHandComponent>();
        if (inHand != null)
        {
            RemoveInHandComponent(card, inHand);
        }

        inHand = new InHandComponent(hand, index);
        AddComponentToEntity(card, inHand);
        hand.InsertCard(card, index);

        _limit.LimitAllExcept(card, this, seat);

        CardMovedToHandMessage message = new(seat, card, index);
        _communication.SendEntityRelated(message, card);
    }

    public void RemoveFromHand(Card card)
    {
        InHandComponent inHand = card.GetComponent<InHandComponent>();
        RemoveInHandComponent(card, inHand);

        CardRemovedFromHandMessage message = new(card);
        _communication.SendEntityRelated(message, card);
    }

    /// <summary>
    /// Если карты не в одной руке, я тебя крашну
    /// </summary>
    /// <param name="card1"></param>
    /// <param name="card2"></param>
    public void SwapCards(Card card1, Card card2)
    {
        InHandComponent inHand1 = card1.GetComponent<InHandComponent>();
        InHandComponent inHand2 = card2.GetComponent<InHandComponent>();

        if (inHand1.Hand != inHand2.Hand)
        {
            // TODO разрешить бы по сути
            throw new Exception("НУ НЕЛЬЗЯ ТАК СВАПАТЬ");
        }

        inHand1.Hand.SwapCards(card1, card2);

        CardsSwappedMessage message = new(card1, card2);
        // TODO ТУТ ДВЕ ЕНТИТИ))) НУ НАДО НАДО СДЕЛАТЬ НОРМАЛЬНО)))
        _communication.SendEntityRelated(message, card1);
    }

    private void RemoveInHandComponent(Card card, InHandComponent inHand)
    {
        _limit.LiftLimitsBySource(card, this);

        RemoveComponentFromEntity(card, inHand);
        inHand.Hand.RemoveCard(card);
    }

    private InHandComponentDTO TransformInHand(InHandComponent inHand, Seat? seat)
    {
        return new InHandComponentDTO(inHand);
    }
}