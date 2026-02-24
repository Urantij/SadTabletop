using SadTabletop.Shared;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Dices;
using SadTabletop.Shared.MoreSystems.Sounds;
using SadTabletop.Shared.Systems.Assets;
using SadTabletop.Shared.Systems.Clicks;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Server.Test;

public class DiceTestSystem : SystemBase
{
    private readonly DicesSystem _dices;
    private readonly AssetsSystem _assets;
    private readonly SeatsSystem _seats;

    private readonly SoundsSystem _sounds;

    private readonly ClicksSystem _clicks;

    private AssetInfo _rant;
    private SoundRemote? _soundRemote;
    private bool _loopMark = false;

    public DiceTestSystem(Game game) : base(game)
    {
    }

    protected override void GameCreated()
    {
        base.GameCreated();

        AssetInfo sqr = _assets.AddImageAsset("squrr", "squrr.png");
        AssetInfo sqr2 = _assets.AddImageAsset("squrr2", "squrr2.png");

        _rant = _assets.AddSoundAsset("rant", "longsound.mp3");

        Seat hero = _seats.EnumerateRealSeats().First();

        Dice mainDice = _dices.CreateDice(1000, 0, [
            new DiceSide(1, "1", null),
            new DiceSide(2, "2", sqr2.Id),
            new DiceSide(3, "3", null),
        ], sqr.Id);

        Dice secondDice = _dices.CreateDice(1000, 200, [
            new DiceSide(1, "a", null),
            new DiceSide(2, "b", null),
            new DiceSide(3, "c", null),
        ], sqr.Id);

        _clicks.AddClick(mainDice, hero, MainClicked, singleUse: false);
        _clicks.AddClick(secondDice, hero, SecondClicked, singleUse: false);
    }

    private void MainClicked(Click obj)
    {
        Dice dice = (Dice)obj.Item;

        int index = dice.CurrentSideIndex + 1;

        if (index >= dice.Sides.Count)
            index = 0;

        _dices.Set(dice, index);
    }

    private void SecondClicked(Click obj)
    {
        Dice dice = (Dice)obj.Item;

        if (_soundRemote != null)
        {
            _sounds.StopSound(_soundRemote);
            _soundRemote = null;
        }
        else
        {
            _soundRemote = _sounds.PlayControllableSound(_rant, loop: _loopMark);
            _loopMark = !_loopMark;
        }

        _dices.Roll(dice);
    }
}