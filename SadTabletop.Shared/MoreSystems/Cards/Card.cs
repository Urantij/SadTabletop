using SadTabletop.Shared.Systems.Limit;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.MoreSystems.Cards;

/// <summary>
/// Отдельно взятая карта на столе.
/// </summary>
public class Card(CardFaceComplicated front, CardFaceComplicated back) : TableItem, ILimitable, ICard
{
    public CardFaceComplicated Front { get; } = front;
    public CardFaceComplicated Back { get; } = back;

    public Flipness Flipness { get; internal set; }
}

public class CardDto(Card card, bool revealFront) : TableItemDto(card)
{
    public CardFaceComplicated? Front { get; } = revealFront ? card.Front : null;
    public CardFaceComplicated Back { get; } = card.Back;

    public Flipness Flipness { get; } = card.Flipness;

    public override Type WhatIsMyType() => typeof(Card);
}