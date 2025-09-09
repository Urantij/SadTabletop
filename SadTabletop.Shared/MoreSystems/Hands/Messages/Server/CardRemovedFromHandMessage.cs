using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.MoreSystems.Hands.Messages.Server;

public class CardRemovedFromHandMessage(Card card) : ServerMessageBase
{
    public Card Card { get; } = card;
}