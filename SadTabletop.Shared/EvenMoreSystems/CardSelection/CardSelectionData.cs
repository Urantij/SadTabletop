using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Decks;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.EvenMoreSystems.CardSelection;

public class CardSelectionData(
    Seat target,
    int minSelect,
    int maxSelect,
    IReadOnlyList<ICard> cards,
    CardInfo[] clientCardsData,
    Action<ICard[]> handler) : EntityBase
{
    public Seat Target { get; } = target;
    public int MinSelect { get; } = minSelect;
    public int MaxSelect { get; } = maxSelect;
    public IReadOnlyList<ICard> Cards { get; } = cards;
    public CardInfo[] ClientCardsData { get; } = clientCardsData;
    public Action<ICard[]> Handler { get; } = handler;
}

public class CardSelectionDataDto(CardSelectionData data) : EntityBaseDto(data)
{
    public Seat Target { get; } = data.Target;
    public int MinSelect { get; } = data.MinSelect;
    public int MaxSelect { get; } = data.MaxSelect;
    public IReadOnlyList<ICard> Cards { get; } = data.ClientCardsData;

    public override Type WhatIsMyType() => typeof(CardSelectionData);
}