using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.MoreSystems.Hands;

public class InHandComponent(Hand hand, int index) : ClientComponentBase
{
    public Hand Hand { get; } = hand;
    public int Index { get; internal set; } = index;
}

public class InHandComponentDTO(InHandComponent inHandComponent) : ClientComponentDto(inHandComponent)
{
    public Seat Owner { get; } = inHandComponent.Hand.Owner;
    public int Index { get; } = inHandComponent.Index;

    public override Type WhatIsMyType() => typeof(InHandComponent);
}