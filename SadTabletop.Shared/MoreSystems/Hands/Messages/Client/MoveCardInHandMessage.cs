using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.MoreSystems.Hands.Messages.Client;

public class MoveCardInHandMessage(Card card, int index) : ClientMessageBase
{
    public Card Card { get; } = card;
    public int Index { get; } = index;
}