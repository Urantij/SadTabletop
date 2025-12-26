using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Synchro;
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
    private readonly SynchroSystem _synchro;

    public VisabilitySystem(Game game) : base(game)
    {
    }

    /// <summary>
    /// Если ентити была скрыта от таргета, сделает видимой.
    /// </summary>
    /// <param name="entity"></param>
    /// <param name="target"></param>
    public void Show(EntityBase entity, Seat? target)
    {
        VisabilityComponent? visability = entity.TryGetComponent<VisabilityComponent>();

        if (visability == null)
            return;

        if (visability.Viewers.Included(target))
            return;

        visability.Viewers.AddToInclude(target);

        ViewedEntity view = _synchro.ViewEntity(entity, target);

        _communication.Send(new EntityAddedMessage(view), target);
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

    /// <summary>
    /// Скроет ентити от всех кроме исключения. Сделает ентити не скрытым для исключения
    /// </summary>
    /// <param name="entity"></param>
    /// <param name="exceptionalTarget"></param>
    /// <param name="sendRelatedMessage"></param>
    public void HideFromEveryoneExcept(EntityBase entity, Seat exceptionalTarget, bool sendRelatedMessage = true)
    {
        Seat?[]? toHideFromThem = sendRelatedMessage
            ? _seats.EnumerateAllSeats()
                .Where(t => t != exceptionalTarget && IsVisibleFor(entity, t))
                .ToArray()
            : null;

        bool announceToExceptional = sendRelatedMessage && !IsVisibleFor(entity, exceptionalTarget);

        Spisok<Seat?> spisok = Spisok<Seat?>.CreateNoOneWithIncluded(exceptionalTarget);

        VisabilityComponent? visability = entity.TryGetComponent<VisabilityComponent>();
        if (visability == null)
        {
            visability = new VisabilityComponent(spisok);
            AddComponentToEntity(entity, visability);
        }
        else
        {
            visability.Viewers = spisok;
        }

        if (toHideFromThem?.Length > 0)
        {
            _communication.Send(new EntityRemovedMessage(entity), toHideFromThem);
        }

        if (announceToExceptional)
        {
            ViewedEntity view = _synchro.ViewEntity(entity, exceptionalTarget);

            _communication.Send(new EntityAddedMessage(view), exceptionalTarget);
        }
    }

    public bool IsVisibleFor(EntityBase entity, Seat? target)
    {
        VisabilityComponent? visability = entity.TryGetComponent<VisabilityComponent>();

        if (visability == null)
            return true;

        return visability.Viewers.Included(target);
    }
}