using SadTabletop.Shared.Systems.Entities;

namespace SadTabletop.Shared.Systems.Table;

public class TableSystem : EntitiesSystem<TableItem>
{
    public TableSystem(Game game) : base(game)
    {
    }
}