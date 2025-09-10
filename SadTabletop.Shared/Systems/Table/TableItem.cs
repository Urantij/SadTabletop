using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.Systems.Table;

public abstract class TableItem : EntityBase
{
    public TableItem()
    {
        
    }

    protected TableItem(float x, float y)
    {
        X = x;
        Y = y;
    }

    public float X { get; internal set; }
    public float Y { get; internal set; }
}

public abstract class TableItemDto(TableItem entity) : EntityBaseDto(entity)
{
    public float X { get; } = entity.X;
    public float Y { get; } = entity.Y;
}