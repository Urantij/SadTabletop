using SadTabletop.Shared.Systems.Limit;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.MoreSystems.Cards;

/// <summary>
/// Отдельно взятая карта на столе.
/// </summary>
public class Card(CardFaceComplicated backSide, CardFaceComplicated frontSide) : TableItem, ILimitable
{
    public CardFaceComplicated BackSide { get; } = backSide;
    public CardFaceComplicated FrontSide { get; } = frontSide;

    public Flipness Flipness { get; internal set; }
}

public class CardDto(Card card, bool revealFront) : TableItemDto(card)
{
    public CardFaceComplicated BackSide { get; } = card.BackSide;
    public CardFaceComplicated? FrontSide { get; } = revealFront ? card.FrontSide : null;

    public Flipness Flipness { get; } = card.Flipness;

    public override Type WhatIsMyType() => typeof(Card);
}