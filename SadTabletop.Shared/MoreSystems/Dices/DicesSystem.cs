using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Dices.Messages;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Limit;
using SadTabletop.Shared.Systems.Limit.Events;
using SadTabletop.Shared.Systems.MyRandom;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.MoreSystems.Dices;

public class DicesSystem : SystemBase
{
    private readonly LimitSystem _limit;
    private readonly EventsSystem _events;
    private readonly ViewerSystem _viewer;
    private readonly RandomSystem _random;
    private readonly CommunicationSystem _communication;

    public DicesSystem(Game game) : base(game)
    {
    }

    protected internal override void GameCreated()
    {
        base.GameCreated();

        _events.Subscribe<LimitedEvent>(EventPriority.Normal, this, Limited);
    }

    protected internal override void GameLoaded()
    {
        base.GameLoaded();

        _viewer.RegisterEntity<Dice>(TransformDice);
    }

    // Разные методы, так как не уверен, мб стоит разные сообщения сделать.
    public void Set(Dice dice, int newIndex)
    {
        dice.CurrentSideIndex = newIndex;

        _communication.SendEntityRelated(new DiceRolledMessage(dice, newIndex), dice);
    }

    public void Roll(Dice dice)
    {
        int newIndex = _random.Get(0, dice.Sides.Count);

        dice.CurrentSideIndex = newIndex;

        _communication.SendEntityRelated(new DiceRolledMessage(dice, newIndex), dice);
    }

    private void Limited(LimitedEvent obj)
    {
        if (obj.Entity is not Dice dice)
            return;

        if (obj.TheyKnowNow != null)
        {
            _communication.SendEntityRelated(new DiceInfoMessage(dice, dice.CurrentSideIndex), dice, obj.TheyKnowNow);
        }

        if (obj.TheyDontKnowNow != null)
        {
            _communication.SendEntityRelated(new DiceInfoMessage(dice, null), dice, obj.TheyDontKnowNow);
        }
    }

    private DiceDto TransformDice(Dice dice, Seat? target)
    {
        int? index;

        if (_limit.IsLimitedFor(dice, target))
        {
            index = null;
        }
        else
        {
            index = dice.CurrentSideIndex;
        }

        return new DiceDto(dice, index);
    }
}