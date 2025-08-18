using SadTabletop.Shared.Mechanics;

namespace SadTabletop.Shared.Systems.Times;

/// <summary>
/// Позволяет создать отложенные вызовы делегатов.
/// Таски внутри игры юзать нельзя, так как нарушается однопоточность.
/// Делегат должен быть запущен извне, где и контролируется однопоточность.
/// </summary>
public class TimesSystem : SystemBase
{
    // TODO подумать над сериализацией и состояниями.

    private readonly List<Delayed> _list = [];

    public event Action<Delayed>? DelayRequested;

    public TimesSystem(Game game) : base(game)
    {
    }

    protected internal override void GameSetuped()
    {
        base.GameSetuped();

        foreach (Delayed delayed in _list)
        {
            Execute(delayed);
        }
    }

    public void Execute(Delayed delayed)
    {
        if (!_list.Remove(delayed))
            return;

        delayed.Delegate.Invoke();
    }

    public void Cancel(Delayed delayed)
    {
        try
        {
            delayed.Cts.Cancel();
            delayed.Cts.Dispose();
        }
        catch
        {
        }

        _list.Remove(delayed);
    }

    public Delayed RequestDelayedExecution(Action @delegate, TimeSpan delay)
    {
        Delayed delayed = new(@delegate, delay, new CancellationTokenSource());

        _list.Add(delayed);

        DelayRequested?.Invoke(delayed);

        return delayed;
    }
}