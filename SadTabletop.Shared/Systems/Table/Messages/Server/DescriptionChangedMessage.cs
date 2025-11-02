using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.Systems.Table.Messages.Server;

public class DescriptionChangedMessage(TableItem item, string? description) : ServerMessageBase
{
    public TableItem Item { get; } = item;
    public string? Description { get; } = description;
}