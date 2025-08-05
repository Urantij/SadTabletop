namespace SadTabletop.Shared.Systems.Times;

public class Delayed(Action @delegate, TimeSpan delay)
{
    public Action Delegate { get; } = @delegate;
    public TimeSpan Delay { get; } = delay;
}