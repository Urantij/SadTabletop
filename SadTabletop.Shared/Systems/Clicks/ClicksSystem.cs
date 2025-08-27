using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Clicks.Messages.Client;
using SadTabletop.Shared.Systems.Clicks.Messages.Server;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Communication.Events;
using SadTabletop.Shared.Systems.Events;
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
    private readonly EventsSystem _events;

    public ClicksSystem(Game game) : base(game)
    {
    }

    protected internal override void GameCreated()
    {
        base.GameCreated();

        _events.Subscribe<ClientMessageReceivedEvent<ClickMessage>>(EventPriority.Normal, this, ClientClicked);
    }

    protected internal override void GameLoaded()
    {
        base.GameLoaded();

        Game.GetSystem<ViewerSystem>().RegisterComponent<ClickComponent>(TransformClick);
    }

    public ClickComponent AddClick(TableItem item, Seat? seat, Action<Click> @delegate, bool singleUse = true)
    {
        ClickComponent component = new(seat, @delegate, singleUse);
        AddComponentToEntity(item, component);

        // компоненты всем видны.. наверное в будущем надо как то поменять, а то тупо
        _communication.SendEntityRelated(new ItemClickyMessage(item, component, true, singleUse), item);

        return component;
    }

    public void RemoveClick(TableItem item, ClickComponent component)
    {
        RemoveComponentFromEntity(item, component);

        _communication.SendEntityRelated(new ItemClickyMessage(item, component, false, null), item);
    }

    private void ClientClicked(ClientMessageReceivedEvent<ClickMessage> obj)
    {
        // TODO на клиенте то нет определения что когда кликается от каокго сита

        ClickComponent? clickComponent =
            obj.Message.Item.TryGetComponent<ClickComponent>(c => c.Id == obj.Message.ClickId);

        if (clickComponent == null)
        {
            // TODO warn
            return;
        }

        if (clickComponent.Seat != obj.Seat)
        {
            // TODO warn
            return;
        }

        if (clickComponent.SingleUse)
        {
            // TODO есть нескоко моментов. если я собираюсь делать 1 клики доступный несколькоим ситам,
            // то мне нужно уведомлять всех ситов кроме того который нажал.
            // но я вроде бы не собирался. но при этом если кнопка для сита нулл, то там может быть несколько клиентов.
            // впрочем, кнопок для нул сита не должно быть мне каж
            // сейчас оно отсылает ивент, и на клиенте будет варн. но пока похуй, я думаю
            RemoveClick(obj.Message.Item, clickComponent);
        }

        clickComponent.Delegate(new Click(obj.Seat, obj.Message.Item, clickComponent));
    }

    private ClickClientComponentDto TransformClick(ClickComponent component, Seat? target)
    {
        return new ClickClientComponentDto(component);
    }
}