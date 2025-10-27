using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.EvenMoreSystems.Playable.Messages.Server;

public class CardPlayabilityChangedMessage(Card card, Seat owner, TableItem[]? targets) : ServerMessageBase
{
    public Card Card { get; } = card;
    public Seat Owner { get; } = owner;
    public TableItem[]? Targets { get; } = targets;
}