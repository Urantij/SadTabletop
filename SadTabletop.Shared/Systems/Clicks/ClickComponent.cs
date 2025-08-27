using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.Systems.Clicks;

public class ClickComponent(Seat? seat, Action<Click> @delegate, bool singleUse) : ClientComponentBase
{
    public Seat? Seat { get; } = seat;
    public Action<Click> Delegate { get; } = @delegate;
    public bool SingleUse { get; } = singleUse;
}

public class ClickClientComponentDto(ClickComponent component) : ClientComponentDto(component)
{
    public Seat? Seat { get; } = component.Seat;
    public bool SingleUse { get; } = component.SingleUse;

    public override Type WhatIsMyType() => typeof(ClickComponent);
}