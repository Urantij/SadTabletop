namespace SadTabletop.Shared.Systems.Times;

public class Delayed(Action @delegate, TimeSpan delay, CancellationTokenSource cts)
{
    public Action Delegate { get; } = @delegate;
    public TimeSpan Delay { get; } = delay;

    internal CancellationTokenSource Cts { get; } = cts;

    public CancellationToken Cancellation => Cts.Token;
}