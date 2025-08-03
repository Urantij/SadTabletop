using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Clicks.Messages.Server;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Table;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.Systems.Clicks;

/// <summary>
/// Позволяет делать <see cref="TableItem"/> кликабельными.
/// </summary>
public class ClicksSystem : ComponentSystemBase
{
    private readonly CommunicationSystem _communication;

    public ClicksSystem(Game game) : base(game)
    {
    }

    protected internal override void GameLoaded()
    {
        base.GameLoaded();
        
        Game.GetSystem<ViewerSystem>().RegisterComponent<ClickComponent>(TransformClick);
    }

    public ClickComponent AddClick(TableItem item, Seat? seat, Action<Click> @delegate)
    {
        ClickComponent component = new(seat, @delegate);
        AddComponentToEntity(item, component);

        // компоненты всем видны.. наверное в будущем надо как то поменять, а то тупо
        _communication.SendEntityRelated(new ItemClickyMessage(item, component, true), item);

        return component;
    }

    public void RemoveClick(TableItem item, ClickComponent component)
    {
        RemoveComponentFromEntity(item, component);

        _communication.SendEntityRelated(new ItemClickyMessage(item, component, false), item);
    }
    
    private ClickComponentDto TransformClick(ClickComponent component, Seat? target)
    {
        return new ClickComponentDto(component);
    }
}