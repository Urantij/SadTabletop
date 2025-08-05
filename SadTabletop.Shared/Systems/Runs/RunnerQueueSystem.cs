using SadTabletop.Shared.Mechanics;

namespace SadTabletop.Shared.Systems.Runs;

/// <summary>
/// Хранит ивенты, которые обязательно сработают.
/// При запуске <see cref="Play"/> играет делегаты, пока они не закончатся, или пока не будет вызван <see cref="Suspend"/>
/// </summary>
public class RunnerQueueSystem : SystemBase
{
    // TODO Сериализация
    private readonly List<Runner> _queue = new();

    /// <summary>
    /// Работает ли цикл ненависти сейчас.
    /// </summary>
    public bool Running { get; private set; } = false;

    public RunnerQueueSystem(Game game) : base(game)
    {
    }

    internal void Insert(IEnumerable<Runner> runners)
    {
        _queue.InsertRange(0, runners);
    }

    /// <summary>
    /// Возвращает ранеров в очередь и запускает её, если она ещё не.
    /// </summary>
    /// <param name="list"></param>
    public void Resume(Runner[] list)
    {
        Insert(list);
        if (!Running)
            Play();
    }

    /// <summary>
    /// Запускает цикл обработки делегатов.
    /// Обычно вызывается после того, как текущий делегат приостановил работу, получил инпут и хочет продолжить.
    /// </summary>
    /// <exception cref="Exception"></exception>
    internal void Play()
    {
        if (Running)
        {
            // TODO лог варн
            return;
        }

        Running = true;

        if (_queue.Count == 0)
        {
            throw new Exception("queue empty");
        }

        while (_queue.Count > 0)
        {
            Runner first = _queue.First();
            _queue.RemoveAt(0);

            first.Run();
        }

        Running = false;
    }

    /// <summary>
    /// Приостанавливает работу очереди и возвращает ранеров, которые остались впереди.
    /// </summary>
    public Runner[] Suspend()
    {
        Runner[] list = _queue.ToArray();
        _queue.Clear();

        return list;
    }
}