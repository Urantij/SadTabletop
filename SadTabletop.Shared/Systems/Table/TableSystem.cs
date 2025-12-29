using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Entities;
using SadTabletop.Shared.Systems.Table.Messages;
using SadTabletop.Shared.Systems.Table.Messages.Server;

namespace SadTabletop.Shared.Systems.Table;

public class TableSystem : EntitiesSystem<TableItem>
{
    private readonly CommunicationSystem _communication;

    public TableSystem(Game game) : base(game)
    {
    }

    public void ChangeDescription(TableItem item, string? newDescription)
    {
        item.Description = newDescription;

        DescriptionChangedMessage message = new(item, newDescription);
        _communication.SendEntityRelated(message, item);
    }

    public void MoveItem(TableItem item, float x, float y)
    {
        item.X = x;
        item.Y = y;

        _communication.SendEntityRelated(new ItemMovedMessage(item, x, y), item);
    }

    /// <summary>
    /// Устанавливает позицию объекта, не сообщая об этом клиентам.
    /// </summary>
    /// <param name="item"></param>
    /// <param name="x"></param>
    /// <param name="y"></param>
    public void SetPosition(TableItem item, float x, float y)
    {
        item.X = x;
        item.Y = y;
    }
}