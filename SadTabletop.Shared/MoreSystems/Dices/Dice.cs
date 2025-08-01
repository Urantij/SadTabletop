using SadTabletop.Shared.Systems.Limit;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.MoreSystems.Dices;

/// <summary>
/// Дайс, у которого есть стороны, и который можно ролить.
/// </summary>
public class Dice(IReadOnlyList<int> sides) : TableItem, ILimitable
{
    public int CurrentSideIndex { get; set; }

    /// <summary>
    /// Должен быть хотя бы один элемент, иначе краш.
    /// </summary>
    public IReadOnlyList<int> Sides { get; } = sides;
}

public class DiceDto(Dice dice, int? currentSideIndex) : TableItemDto(dice)
{
    public int? CurrentSideIndex { get; } = currentSideIndex;

    public IReadOnlyList<int> Sides { get; } = dice.Sides;
}