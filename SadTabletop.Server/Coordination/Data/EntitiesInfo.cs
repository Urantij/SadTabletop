using SadTabletop.Shared.Mechanics;

namespace SadTabletop.Server.Coordination.Data;

public class EntitiesInfo(SystemBase system, ICollection<IEntity> entities)
{
    public SystemBase System { get; } = system;
    public ICollection<IEntity> Entities { get; } = entities;
}