using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.MoreSystems.Cards.Messages.Client;

public class FlipCardMessage(Card card) : ClientMessageBase
{
    public Card Card { get; } = card;
}