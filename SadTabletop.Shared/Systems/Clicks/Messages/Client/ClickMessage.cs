using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.Systems.Clicks.Messages.Client;

public class ClickMessage(int itemId, int clickId) : ClientMessageBase
{
    // да можно было дальше ломать комедию с сериализацией, но я устал
    public int ItemId { get; } = itemId;
    public int ClickId { get; } = clickId;
}