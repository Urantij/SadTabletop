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
    private readonly SeatsSystem _seats;

    public LimitSystem(Game game) : base(game)
    {
    }

    public LimitComponent LimitAllExcept<T>(T entity, object source, Seat seat) where T : EntityBase, ILimitable
    {
        LimitComponent? limit = entity.TryGetComponent<LimitComponent>(l => l.Source == source);

        Seat?[] toLimit = _seats.EnumerateAllSeats()
        .Where(s => s != seat)
        .Where(s => !IsLimitedFor(entity, s))
        .ToArray();

        if (limit != null)
        {
            foreach (Seat? target in toLimit)
            {
                if (!limit.Targets.Included(target))
                    limit.Targets.AddToInclude(target);
            }
        }
        else
        {
            limit = new LimitComponent(source, Spisok<Seat?>.CreateAllWithExcluded(seat));
            AddComponentToEntity(entity, limit);
        }

        if (toLimit.Length > 0)
        {
            _events.Invoke(new LimitedEvent(entity, theyDontKnowNow: toLimit));
        }

        return limit;
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
    public LimitComponent LimitFor<T>(T entity, object source, Seat? seat) where T : EntityBase, ILimitable
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

    public void LiftLimitsBySource<T>(T entity, object source) where T : EntityBase, ILimitable
    {
        LimitComponent[] comps = entity.EnumerateComponents()
        .OfType<LimitComponent>()
        .Where(c => c.Source == source)
        .ToArray();

        if (comps.Length == 0)
            return;

        // TODO тупо както

        List<Seat?> theyWereLimited = [];

        foreach (Seat? seat in _seats.EnumerateAllSeats())
        {
            if (IsLimitedFor(entity, seat))
            {
                theyWereLimited.Add(seat);
            }
        }

        foreach (LimitComponent comp in comps)
        {
            RemoveComponentFromEntity(entity, comp);
        }

        Seat?[] theyKnow = theyWereLimited
        .Where(s => !IsLimitedFor(entity, s))
        .ToArray();

        if (theyKnow.Length > 0)
        {
            _events.Invoke(new LimitedEvent(entity, theyKnowNow: theyKnow));
        }
    }

    public bool IsLimitedFor<T>(T entity, Seat? seat) where T : EntityBase, ILimitable
    {
        return entity.EnumerateComponents()
            .OfType<LimitComponent>()
            .Any(l => l.Targets.Included(seat));
    }
}