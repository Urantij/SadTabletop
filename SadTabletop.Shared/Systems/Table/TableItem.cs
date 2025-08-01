using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.Systems.Table;

public abstract class TableItem : EntityBase
{
    public float X { get; set; }
    public float Y { get; set; }
}

public abstract class TableItemDto(TableItem entity) : EntityBaseDto(entity)
{
    public float X { get; } = entity.X;
    public float Y { get; } = entity.Y;
}