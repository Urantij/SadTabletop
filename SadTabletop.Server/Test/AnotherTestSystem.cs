using SadTabletop.Shared;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Decks;
using SadTabletop.Shared.MoreSystems.Hands;
using SadTabletop.Shared.Systems.Clicks;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Times;

namespace SadTabletop.Server.Test;

public class AnotherTestSystem : SystemBase
{
    private readonly TimesSystem _times;
    private readonly DecksSystem _decks;

    private Deck deck;

    public AnotherTestSystem(Game game) : base(game)
    {
    }

    protected override void GameCreated()
    {
        base.GameCreated();

        deck = _decks.Create(-200, 400, Flipness.Shown, [
            new DeckCardInfo(77, 4),
            new DeckCardInfo(77, 7),
            new DeckCardInfo(77, 4),
            new DeckCardInfo(77, 7),
            new DeckCardInfo(77, 4),
            new DeckCardInfo(77, 7),
            new DeckCardInfo(77, 4),
            new DeckCardInfo(77, 7),
            new DeckCardInfo(77, 4),
            new DeckCardInfo(77, 7),
            new DeckCardInfo(77, 4),
            new DeckCardInfo(77, 7),
        ]);

        Game.GetSystem<ClicksSystem>().AddClick(deck, Game.GetSystem<SeatsSystem>().GetEntity(1), DeckClicked, false);

        // _times.RequestDelayedExecution(FirstEx, TimeSpan.FromSeconds(5));
    }

    private void DeckClicked(Click click)
    {
        if (deck.Cards.Count == 0)
            return;

        DecksSystem decks = Game.GetSystem<DecksSystem>();
        HandsSystem hands = Game.GetSystem<HandsSystem>();
        ClicksSystem clicks = Game.GetSystem<ClicksSystem>();

        Card card = decks.GetCard(deck, deck.X, deck.Y, Flipness.Shown);
        clicks.AddClick(card, click.Seat, CardClicked, true);

        Hand hand = hands.GetHand(click.Seat);

        hands.AddToHand(card, click.Seat, hand.Cards.Count);
    }

    private void CardClicked(Click click)
    {
        Card card = (Card)click.Item;

        DecksSystem decks = Game.GetSystem<DecksSystem>();
        HandsSystem hands = Game.GetSystem<HandsSystem>();

        hands.RemoveFromHand(card);
        decks.PutCard(deck, card, DeckWay.Front);
    }

    private void FirstEx()
    {
        Card card = _decks.GetCard(deck, 200, 400, Flipness.Shown);

        _times.RequestDelayedExecution(() =>
        {
            _decks.PutCard(deck, card, DeckWay.Front);

            _times.RequestDelayedExecution(FirstEx, TimeSpan.FromSeconds(5));
        }, TimeSpan.FromSeconds(5));
    }
}