using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Shared.MoreSystems.Hands.Messages.Server;

public class CardMovedToHandMessage(Seat owner, Card card, int index) : ServerMessageBase
{
    public Seat Owner { get; } = owner;
    public Card Card { get; } = card;
    public int Index { get; } = index;
}