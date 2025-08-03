using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Shared.Systems.Clicks;

public class ClickComponent(Seat? seat, Action<Click> @delegate) : ClientComponentBase
{
    public Seat? Seat { get; } = seat;
    public Action<Click> Delegate { get; } = @delegate;
}

public class ClickComponentDto(ClickComponent component) : IComponent
{
    public Seat? Seat { get; } = component.Seat;

    public Type WhatIsMyType() => typeof(ClickComponent);
}