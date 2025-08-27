using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Runs;

namespace SadTabletop.Shared.Systems.Events;

/// <summary>
/// Позволяет хранить, подписываться на и вызывать ивенты.
/// Когда кто-то подписывается на событие, создаётся <see cref="EventRecord"/> и хранится в системе.
/// При вызове ивента, берутся все подписчики этого ивента, и по очереди вызываются их делегаты.
/// Так как делегаты могут приостанавливать процесс игры (Например, делегат выводит вопрос на экран и ждёт инпут),
/// при вызове делегата будут созданы объекты, ссылающиеся на них,
/// и которые формируют текущую очередь срабатывающих делегатов <see cref="Runner"/>
/// </summary>
public class EventsSystem : SystemBase
{
    private readonly RunnerQueueSystem _queueSystem;

    // TODO Сериализация
    private readonly List<EventRecord> _records = new();

    public EventsSystem(Game game) : base(game)
    {
    }

    /// <summary>
    /// Вкидывает этот ивент и запускает создание цепочки делегатов.
    /// Запускает <see cref="RunnerQueueSystem"/>, если тот не раннинг.
    /// </summary>
    /// <param name="eventObject"></param>
    public void Invoke(EventBase eventObject)
    {
        Type targetEventType = eventObject.GetType();

        List<Runner> runners = _records
            .Where(record => record.TargetEventType == targetEventType)
            .OrderBy(record => record.Priority)
            .Select(record => new Runner(record.Delegate, eventObject))
            .ToList();

        if (runners.Count == 0)
            return;

        _queueSystem.Insert(runners);

        if (!_queueSystem.Running)
            _queueSystem.Play();
    }

    public void Subscribe<TArg>(EventPriority priority, object subscriber, Action<TArg> @delegate)
        where TArg : EventBase
    {
        Type targetEventType = typeof(TArg);

        EventRecord info = new(priority, targetEventType, @delegate, subscriber);
        _records.Add(info);
    }
}