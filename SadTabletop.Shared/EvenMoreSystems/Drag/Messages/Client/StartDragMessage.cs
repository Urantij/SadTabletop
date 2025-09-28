using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.EvenMoreSystems.Drag.Messages.Client;

public class StartDragMessage(TableItem item) : ClientMessageBase
{
    public TableItem Item { get; } = item;
}