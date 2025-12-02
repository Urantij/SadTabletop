using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Synchro;

namespace SadTabletop.Shared.MoreSystems.Decks.Messages;

public class DeckCardRemovedMessage(
    Deck deck,
    ViewedEntity card,
    CardFaceComplicated? side,
    CardFaceComplicated? cardFront,
    int? cardIndex) : ServerMessageBase
{
    public Deck Deck { get; } = deck;
    public ViewedEntity Card { get; } = card;

    /// <summary>
    /// Новое отображаемое ето колоды, если изменилось
    /// </summary>
    public CardFaceComplicated? Side { get; } = side;

    /// <summary>
    /// Если клиент знал, какие карты в колоде лежат, но не знал порядок, ему нужно знать, какую карту убрали.
    /// Вот только бывают ситуации, когда пришла в <see cref="DeckCardRemovedMessage.Card"/>, а там лицо лимитед)))
    /// Так что))) ну))) типа)))
    /// </summary>
    public CardFaceComplicated? CardFront { get; } = cardFront;

    /// <summary>
    /// Индекс карты в колоде, если клиент видел порядок
    /// </summary>
    public int? CardIndex { get; } = cardIndex;
}