using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.MoreSystems.Decks.Messages;

public class DeckCardInsertedMessage(
    Deck deck,
    Card card,
    int cardDeckId,
    CardFaceComplicated? side,
    CardFaceComplicated? cardFront,
    int? deckIndex) : ServerMessageBase
{
    public Deck Deck { get; } = deck;

    /// <summary>
    /// Здесь будет старый айди
    /// </summary>
    public Card Card { get; } = card;

    /// <summary>
    /// Айди карты после вклада в деку
    /// </summary>
    public int CardDeckId { get; } = cardDeckId;

    /// <summary>
    /// Если изображение деки меняется, клиенту нужно об этом узнать
    /// </summary>
    public CardFaceComplicated? Side { get; } = side;

    /// <summary>
    /// Если клиент не знал лицо карты, но он видит содержимое колоды, ему нужно узнать, что это за карта
    /// </summary>
    public CardFaceComplicated? CardFront { get; } = cardFront;

    /// <summary>
    /// Если клиент знает порядок карт в колоде, ему нужно также знать место карты в колоде
    /// </summary>
    public int? DeckIndex { get; } = deckIndex;
}