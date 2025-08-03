using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.Systems.Clicks.Messages.Server;

public class ItemClickyMessage(TableItem item, ClickComponent component, bool isClicky) : ServerMessageBase
{
    public TableItem Item { get; } = item;
    public ComponentBase Component { get; } = component;
    public bool IsClicky { get; } = isClicky;
}