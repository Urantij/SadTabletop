using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.Systems.Clicks.Messages.Client;

public class ClickMessage(TableItem item, int clickId) : ClientMessageBase
{
    // да можно было дальше ломать комедию с сериализацией, но я устал
    public TableItem Item { get; } = item;
    public int ClickId { get; } = clickId;
}