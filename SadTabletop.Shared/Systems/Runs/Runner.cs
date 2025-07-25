using SadTabletop.Shared.Systems.Events;

namespace SadTabletop.Shared.Systems.Runs;

/// <summary>
/// Одноразовый делегат, который будет выполнен в порядке очереди в <see cref="RunnerQueueSystem"/>
/// </summary>
public class Runner
{
    public Delegate RunDelegate { get; init; }
    public EventBase Argument { get; init; }

    public Runner(Delegate runDelegate, EventBase argument)
    {
        RunDelegate = runDelegate;
        Argument = argument;
    }

    public void Run()
    {
        RunDelegate.Method.Invoke(RunDelegate.Target, parameters: [Argument]);
    }
}