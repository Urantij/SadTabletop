using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Limit.Events;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Shared.Systems.Limit;

/// <summary>
/// Следит за появлением и исчезновением "ограничения" на ентити.
/// Сами ентити решают, что происходит, когда они становятся ограниченными или наоборот.
/// Но разные источними могут накладывать ограничения на разные места, и изменения отслеживает эта система. 
/// </summary>
public class LimitSystem : ComponentSystemBase
{
    private readonly EventsSystem _events;

    public LimitSystem(Game game) : base(game)
    {
    }

    /// <summary>
    /// Ограничивает сущность для места.
    /// Если ограничение с этим источник уже есть, обновляет тот компонент.
    /// Иначе создаёт новый компонент.
    /// </summary>
    /// <param name="entity"></param>
    /// <param name="source"></param>
    /// <param name="seat"></param>
    /// <returns></returns>
    public LimitComponent Limit<T>(T entity, object source, Seat? seat) where T : EntityBase, ILimitable
    {
        LimitComponent? limit = entity.TryGetComponent<LimitComponent>(l => l.Source == source);

        bool wasLimited = IsLimitedFor(entity, seat);

        if (limit != null)
        {
            if (limit.Targets.Included(seat))
                return limit;

            limit.Targets.AddToInclude(seat);
        }
        else
        {
            limit = new LimitComponent(source, Spisok<Seat?>.CreateNoOneWithIncluded(seat));
            AddComponentToEntity(entity, limit);
        }

        // не знаю зачем я так чувствую ептыть
        if (!wasLimited && IsLimitedFor(entity, seat))
        {
            _events.Invoke(new LimitedEvent(entity, theyDontKnowNow: [seat]));
        }

        return limit;
    }

    /// <summary>
    /// Снимает ограничение с сущности для места.
    /// </summary>
    /// <param name="entity"></param>
    /// <param name="source"></param>
    /// <param name="seat"></param>
    public void LiftLimit<T>(T entity, object source, Seat? seat) where T : EntityBase, ILimitable
    {
        LimitComponent? limit = entity.TryGetComponent<LimitComponent>(l => l.Source == source);

        if (limit == null)
            return;

        bool wasLimited = IsLimitedFor(entity, seat);

        limit.Targets.RemoveFromInclude(seat);

        if (limit.Targets.IsListEmpty())
        {
            RemoveComponentFromEntity(entity, limit);
        }

        if (wasLimited && !IsLimitedFor(entity, seat))
        {
            _events.Invoke(new LimitedEvent(entity, theyKnowNow: [seat]));
        }
    }

    public bool IsLimitedFor<T>(T entity, Seat? seat) where T : EntityBase, ILimitable
    {
        return entity.EnumerateComponents()
            .OfType<LimitComponent>()
            .Any(l => l.Targets.Included(seat));
    }
}