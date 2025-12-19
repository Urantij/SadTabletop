using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Synchro;

namespace SadTabletop.Shared.MoreSystems.Decks.Messages;

public class DeckCardRemovedMessage(
    Deck deck,
    ViewedEntity card,
    CardFaceComplicated? side,
    int? cardDeckId) : ServerMessageBase
{
    public Deck Deck { get; } = deck;
    public ViewedEntity Card { get; } = card;

    /// <summary>
    /// Новое отображаемое ето колоды, если изменилось
    /// </summary>
    public CardFaceComplicated? Side { get; } = side;

    /// <summary>
    /// Айди карты в колоде.
    /// </summary>
    public int? CardDeckId { get; } = cardDeckId;
}