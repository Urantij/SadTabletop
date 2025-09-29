using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.MoreSystems.Cards.Messages.Server;

public class CardInfoMessage(Card card, int? front) : ServerMessageBase
{
    public Card Card { get; } = card;
    public int? Front { get; } = front;
}