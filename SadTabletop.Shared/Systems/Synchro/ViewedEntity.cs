using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.Systems.Synchro;

/// <summary>
/// Обработанная <see cref="ViewerSystem"/> системой ентити с компонентами.
/// </summary>
public class ViewedEntity(IEntity entity, IReadOnlyList<IComponent> components)
{
    public IEntity Entity { get; } = entity;
    public IReadOnlyList<IComponent> Components { get; } = components;
}