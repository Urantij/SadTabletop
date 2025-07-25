using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.MoreSystems.Dices.Messages;

public class DiceInfoMessage(Dice dice, int? newIndex) : ServerMessageBase
{
    public Dice Dice { get; } = dice;
    public int? NewIndex { get; } = newIndex;
}