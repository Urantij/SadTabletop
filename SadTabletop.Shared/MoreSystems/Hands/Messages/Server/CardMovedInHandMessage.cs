using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.MoreSystems.Hands.Messages.Server;

public class CardMovedInHandMessage(Card card, int index) : ServerMessageBase
{
    public Card Card { get; } = card;
    public int Index { get; } = index;
}