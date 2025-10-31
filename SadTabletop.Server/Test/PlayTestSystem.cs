using SadTabletop.Shared;
using SadTabletop.Shared.EvenMoreSystems.Playable;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Hands;
using SadTabletop.Shared.MoreSystems.Hints;
using SadTabletop.Shared.Systems.Clicks;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Server.Test;

public class PlayTestSystem : SystemBase
{
    private readonly SeatsSystem _seats;
    private readonly ClicksSystem _clicks;
    private readonly CardsSystem _cards;
    private readonly HandsSystem _hands;
    private readonly PlayableSystem _play;
    private readonly HintsSystem _hints;

    private string? hint = null;
    private int counter = 0;

    public PlayTestSystem(Game game) : base(game)
    {
    }

    protected override void GameCreated()
    {
        base.GameCreated();

        Seat seat = _seats.EnumerateRealSeats().First();

        Card cardToFlip = _cards.Create(-500, 500, 4, 22, Flipness.Shown);

        Card selfClipCard = _cards.Create(0, 0, 4, 22, Flipness.Shown, false);
        _hands.AddToHand(selfClipCard, seat);
        _play.MakePlayable(selfClipCard, seat, item => { _cards.Flip(selfClipCard); });

        Card clipCard = _cards.Create(0, 0, 7, 22, Flipness.Shown, false);
        _hands.AddToHand(clipCard, seat);
        _play.MakePlayable(clipCard, seat, item => { _cards.Flip((Card)item); }, cardToFlip);

        Card clickCard = _cards.Create(500, 500, 4, 22, Flipness.Shown);
        _clicks.AddClick(clickCard, seat, click =>
        {
            _cards.Flip(clickCard);

            counter++;
            if (hint != null)
            {
                hint = null;
            }
            else
            {
                hint = $"ЗДАРОВА {counter}";
            }

            _hints.GiveHint(seat, hint);
        }, false);
    }
}