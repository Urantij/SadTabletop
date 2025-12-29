using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Events;

namespace SadTabletop.Shared.MoreSystems.Decks.Events;

public class CardAddingToDeckEvent(Deck deck, Card card) : EventBase
{
    public Deck Deck { get; } = deck;
    public Card Card { get; } = card;
}