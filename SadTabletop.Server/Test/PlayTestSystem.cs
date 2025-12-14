using SadTabletop.Shared;
using SadTabletop.Shared.EvenMoreSystems.Playable;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Hands;
using SadTabletop.Shared.MoreSystems.Hints;
using SadTabletop.Shared.MoreSystems.Settings;
using SadTabletop.Shared.MoreSystems.Settings.Variants;
using SadTabletop.Shared.Systems.Clicks;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Table;

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

        Card cardToFlip = _cards.Create(-500, 500,
            CardFaceComplicated.CreateBuilder(4).WithText("hi", 0, 125, 259, 50, "Blue").Build(),
            CardFaceComplicated.CreateSimple(22), Flipness.Shown);

        Card selfClipCard = _cards.Create(0, 0, CardFaceComplicated.CreateSimple(4),
            CardFaceComplicated.CreateSimple(22), Flipness.Shown, sendRelatedMessage: false);
        _hands.AddToHand(selfClipCard, seat);
        _play.MakePlayable(selfClipCard, seat, item => { _cards.Flip(selfClipCard); });

        Card clipCard = _cards.Create(0, 0, CardFaceComplicated.CreateSimple(7), CardFaceComplicated.CreateSimple(22),
            Flipness.Shown, sendRelatedMessage: false);
        _hands.AddToHand(clipCard, seat);
        _play.MakePlayable(clipCard, seat, item => { _cards.Flip((Card)item); }, cardToFlip);

        CameraBoundSetting? setting = null;

        Card clickCard = _cards.Create(500, 500, CardFaceComplicated.CreateSimple(4),
            CardFaceComplicated.CreateSimple(22), Flipness.Shown);
        Game.GetSystem<TableSystem>().ChangeDescription(clickCard, "НАЖМИ МЕНЯ ПЖ");
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

            if (setting == null)
            {
                setting = Game.GetSystem<SettingsSystem>().SetCameraBounds(-1000, -500, 2000, 1000);
            }
            else
            {
                Game.GetSystem<SettingsSystem>().RemoveCameraBounds();
                setting = null;
            }
        }, false);
    }
}