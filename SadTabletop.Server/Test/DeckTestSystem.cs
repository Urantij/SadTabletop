using SadTabletop.Shared;
using SadTabletop.Shared.EvenMoreSystems.CardSelection;
using SadTabletop.Shared.EvenMoreSystems.Playable;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Decks;
using SadTabletop.Shared.Systems.Clicks;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Server.Test;

public class DeckTestSystem : SystemBase
{
    private readonly CardsSystem _cards;
    private readonly DecksSystem _decks;
    private readonly SeatsSystem _seats;
    private readonly ClicksSystem _clicks;
    private readonly PlayableSystem _playable;
    private readonly CardSelectionSystem _selection;

    public DeckTestSystem(Game game) : base(game)
    {
    }

    protected override void GameCreated()
    {
        base.GameCreated();

        Seat seat = _seats.EnumerateRealSeats().First();

        Deck deck = _decks.CreateNew(-200, 900, Flipness.Shown, [
            new CardInfo(0, CardFaceComplicated.CreateSimple(7), CardFaceComplicated.CreateSimple(22)),
            new CardInfo(0, CardFaceComplicated.CreateSimple(4), CardFaceComplicated.CreateSimple(22)),
            new CardInfo(0, CardFaceComplicated.CreateSimple(7), CardFaceComplicated.CreateSimple(22)),
            new CardInfo(0, CardFaceComplicated.CreateSimple(4), CardFaceComplicated.CreateSimple(22)),
            new CardInfo(0, CardFaceComplicated.CreateSimple(7), CardFaceComplicated.CreateSimple(22)),
            new CardInfo(0, CardFaceComplicated.CreateSimple(4), CardFaceComplicated.CreateSimple(22))
        ], orderedContentViewers: Spisok.CreateNoOneWithIncluded(seat));

        _clicks.AddClick(deck, seat,
            (_) =>
            {
                _selection.MakeSelection(seat, 1, 1, deck.Cards, (selectedCards) =>
                {
                    foreach (Card card in selectedCards.Cast<Card>())
                    {
                        _decks.DrawCard(deck, card, seat);

                        _playable.MakePlayable(card, seat, (_) => { _decks.PutCard(deck, card, DeckWay.Back); },
                            singleUse: true);
                    }
                });
            }, singleUse: false);
    }
}