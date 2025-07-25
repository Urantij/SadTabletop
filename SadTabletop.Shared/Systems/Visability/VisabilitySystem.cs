using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Synchro.Messages;

namespace SadTabletop.Shared.Systems.Visability;

/// <summary>
/// Определяет, способны ли <see cref="Seat"/> видеть определённые <see cref="EntityBase"/>.
/// По умолчанию ентити видны всем, если у них нет компонента <see cref="VisabilityComponent"/>,
/// который позволяет настраивать видимость ентити.
/// </summary>
public class VisabilitySystem : ComponentSystemBase
{
    private readonly SeatsSystem _seats;
    private readonly CommunicationSystem _communication;

    public VisabilitySystem(Game game) : base(game)
    {
    }

    public void Show(EntityBase entity, Seat? target)
    {
        VisabilityComponent? visability = entity.TryGetComponent<VisabilityComponent>();
        
        if (visability == null)
            return;
        
        if (visability.Viewers.Included(target))
            return;
        
        visability.Viewers.AddToInclude(target);
        
        _communication.Send(new EntityAddedMessage(entity), target);
    }

    /// <summary>
    /// Скрывает ентити для указанного места.
    /// Если у ентити нет компонента <see cref="VisabilityComponent"/>,
    /// создаст его и добавит нужные настройки.
    /// </summary>
    /// <param name="entity"></param>
    /// <param name="target"></param>
    public void Hide(EntityBase entity, Seat? target)
    {
        VisabilityComponent? visability = entity.TryGetComponent<VisabilityComponent>();

        if (visability == null)
        {
            Spisok<Seat?> spisok = Spisok<Seat?>.CreateAllWithExcluded(target);
            
            visability = new VisabilityComponent(spisok);
            AddComponentToEntity(entity, visability);
        }
        else
        {
            if (!visability.Viewers.Included(target))
                return;
            
            visability.Viewers.RemoveFromInclude(target);
        }
        
        _communication.Send(new EntityRemovedMessage(entity), target);
    }

    public bool IsVisibleFor(EntityBase entity, Seat? target)
    {
        VisabilityComponent? visability = entity.TryGetComponent<VisabilityComponent>();

        if (visability == null)
            return true;

        return visability.Viewers.Included(target);
    }
}