using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Table;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.EvenMoreSystems.Playable;

public class PlayableComponent(Seat owner, TableItem[]? targets, Action<TableItem?> playHandler, bool singleUse)
    : ClientComponentBase
{
    public Seat Owner { get; } = owner;
    public TableItem[]? Targets { get; } = targets;
    public Action<TableItem?> PlayHandler { get; } = playHandler;
    public bool SingleUse { get; } = singleUse;
}

public class PlayableComponentDto(PlayableComponent component) : ClientComponentDto(component)
{
    public Seat Owner { get; } = component.Owner;
    public TableItem[]? Targets { get; } = component.Targets;

    public override Type WhatIsMyType() => typeof(PlayableComponent);
}