using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.Systems.Synchro;

/// <summary>
/// Обработанная <see cref="ViewerSystem"/> системой ентити с компонентами.
/// Сам не создавай, используй систему <see cref="SynchroSystem"/>
/// </summary>
public class ViewedEntity(IEntity entity, IReadOnlyList<IClientComponent> components)
{
    public IEntity Entity { get; } = entity;
    public IReadOnlyList<IClientComponent> Components { get; } = components;
}