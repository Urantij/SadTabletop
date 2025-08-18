using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Entities;
using SadTabletop.Shared.Systems.Table.Messages;

namespace SadTabletop.Shared.Systems.Table;

public class TableSystem : EntitiesSystem<TableItem>
{
    private readonly CommunicationSystem _communication;

    public TableSystem(Game game) : base(game)
    {
    }

    public void MoveItem(TableItem item, float x, float y)
    {
        item.X = x;
        item.Y = y;

        _communication.SendEntityRelated(new ItemMovedMessage(item, x, y), item);
    }
}