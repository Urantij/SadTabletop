namespace SadTabletop.Shared.Systems.Events;

/// <summary>
/// Запись о подписчике какого то ивента. Кто, что и когда.
/// <see cref="EventsSystem"/>
/// </summary>
public class EventRecord(EventPriority priority, Type targetEventType, Delegate @delegate, object? subscriber)
{
    public EventPriority Priority { get; } = priority;
    public Type TargetEventType { get; } = targetEventType;
    public Delegate Delegate { get; } = @delegate;
    public object? Subscriber { get; } = subscriber;
}