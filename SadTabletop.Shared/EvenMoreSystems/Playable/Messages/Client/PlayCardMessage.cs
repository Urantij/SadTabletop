using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.EvenMoreSystems.Playable.Messages.Client;

public class PlayCardMessage(Card card, TableItem? target) : ClientMessageBase
{
    public Card Card { get; } = card;
    public TableItem? Target { get; } = target;
}