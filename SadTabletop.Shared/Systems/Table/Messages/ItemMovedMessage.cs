using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.Systems.Table.Messages;

public class ItemMovedMessage(TableItem item, float x, float y) : ServerMessageBase
{
    public TableItem Item { get; } = item;
    public float X { get; } = x;
    public float Y { get; } = y;
}