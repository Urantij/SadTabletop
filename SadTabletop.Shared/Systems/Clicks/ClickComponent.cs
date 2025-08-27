using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.Systems.Clicks;

public class ClickComponent(Seat? seat, Action<Click> @delegate) : ClientComponentBase
{
    public Seat? Seat { get; } = seat;
    public Action<Click> Delegate { get; } = @delegate;
}

public class ClickClientComponentDto(ClickComponent component) : ClientComponentDto(component)
{
    public Seat? Seat { get; } = component.Seat;

    public override Type WhatIsMyType() => typeof(ClickComponent);
}