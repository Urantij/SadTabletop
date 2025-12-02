using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.MoreSystems.Cards.Messages.Server;

public class CardInfoMessage(Card card, CardFaceComplicated? front) : ServerMessageBase
{
    public Card Card { get; } = card;
    public CardFaceComplicated? Front { get; } = front;
}