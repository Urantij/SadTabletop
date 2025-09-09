using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.MoreSystems.Hands.Messages.Server;

public class CardsSwappedMessage(Card card1, Card card2) : ServerMessageBase
{
    public Card Card1 { get; } = card1;
    public Card Card2 { get; } = card2;
}