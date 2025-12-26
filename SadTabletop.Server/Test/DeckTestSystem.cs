using SadTabletop.Shared;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Decks;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Server.Test;

public class DeckTestSystem : SystemBase
{
    private readonly DecksSystem _decks;
    private readonly SeatsSystem _seats;

    public DeckTestSystem(Game game) : base(game)
    {
    }

    protected override void GameCreated()
    {
        base.GameCreated();

        Seat seat = _seats.EnumerateRealSeats().First();

        Deck deck = _decks.Create(-200, 900, Flipness.Shown, [
            new CardInfo(0, CardFaceComplicated.CreateSimple(7), CardFaceComplicated.CreateSimple(22)),
            new CardInfo(0, CardFaceComplicated.CreateSimple(4), CardFaceComplicated.CreateSimple(22)),
            new CardInfo(0, CardFaceComplicated.CreateSimple(7), CardFaceComplicated.CreateSimple(22)),
            new CardInfo(0, CardFaceComplicated.CreateSimple(4), CardFaceComplicated.CreateSimple(22)),
            new CardInfo(0, CardFaceComplicated.CreateSimple(7), CardFaceComplicated.CreateSimple(22)),
            new CardInfo(0, CardFaceComplicated.CreateSimple(4), CardFaceComplicated.CreateSimple(22))
        ], orderedContentViewers: Spisok.CreateNoOneWithIncluded(seat));
    }
}