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
    /// Если тру, после завершение вызова текущего раннера, очередь не будет играть дальше.
    /// </summary>
    public bool Suspended { get; private set; } = false;

    /// <summary>
    /// Работает ли цикл ненависти сейчас.
    /// </summary>
    public bool Running { get; private set; } = false;

    public RunnerQueueSystem(Game game) : base(game)
    {
    }

    public void Insert(IEnumerable<Runner> runners)
    {
        _queue.InsertRange(0, runners);
    }

    /// <summary>
    /// Запускает цикл обработки делегатов.
    /// Обычно вызывается после того, как текущий делегат приостановил работу, получил инпут и хочет продолжить.
    /// </summary>
    /// <exception cref="Exception"></exception>
    public void Play()
    {
        if (Running)
        {
            // TODO лог варн
            return;
        }

        Running = true;

        while (_queue.Count > 0)
        {
            Runner first = _queue.First();
            _queue.RemoveAt(0);

            first.Run();

            if (Suspended)
            {
                Suspended = false;
                Running = false;
                return;
            }
        }

        throw new Exception("queue empty");
    }

    /// <summary>
    /// Приостанавливает работу очереди.
    /// </summary>
    public void Suspend()
    {
        Suspended = true;
    }
}