using SadTabletop.Shared.Systems.Limit;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.MoreSystems.Cards;

/// <summary>
/// Отдельно взятая карта на столе.
/// </summary>
public class Card(int backSide, int frontSide) : TableItem, ILimitable
{
    public int BackSide { get; } = backSide;
    public int FrontSide { get; } = frontSide;

    public Flipness Flipness { get; internal set; }
}

public class CardDto(Card card, int? frontSide) : TableItemDto(card)
{
    public int BackSide { get; } = card.BackSide;
    public int? FrontSide { get; } = frontSide;

    public Flipness Flipness { get; } = card.Flipness;

    public override Type WhatIsMyType() => typeof(Card);
}