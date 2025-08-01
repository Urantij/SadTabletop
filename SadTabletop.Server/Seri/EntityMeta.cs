namespace SadTabletop.Server.Seri;

public class EntityMeta(Type systemType, IReadOnlyList<Type> entityTypes)
{
    public Type SystemType { get; } = systemType;
    public IReadOnlyList<Type> EntityTypes { get; } = entityTypes;
}