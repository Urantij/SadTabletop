using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.EvenMoreSystems.Playable.Messages.Server;

public class CardUnplayabilityMessage(Card card) : ServerMessageBase
{
    public Card Card { get; } = card;
}