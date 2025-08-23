using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Synchro;

namespace SadTabletop.Shared.MoreSystems.Decks.Messages;

public class DeckCardRemovedMessage(Deck deck, ViewedEntity card, int? side, int? cardIndex) : ServerMessageBase
{
    public Deck Deck { get; } = deck;
    public ViewedEntity Card { get; } = card;

    /// <summary>
    /// Новое отображаемое ето колоды, если изменилось
    /// </summary>
    public int? Side { get; } = side;

    /// <summary>
    /// Индекс карты в колоде, если клиент видел порядок
    /// </summary>
    public int? CardIndex { get; } = cardIndex;
}