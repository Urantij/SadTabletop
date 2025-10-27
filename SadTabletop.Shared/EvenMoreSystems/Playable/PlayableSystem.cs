using SadTabletop.Shared.EvenMoreSystems.Playable.Messages.Client;
using SadTabletop.Shared.EvenMoreSystems.Playable.Messages.Server;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Communication.Events;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Table;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.EvenMoreSystems.Playable;

public class PlayableSystem : ComponentSystemBase
{
    private readonly ViewerSystem _viewer;
    private readonly EventsSystem _events;
    private readonly CommunicationSystem _communication;

    public PlayableSystem(Game game) : base(game)
    {
    }

    protected internal override void GameCreated()
    {
        base.GameCreated();

        _events.Subscribe<ClientMessageReceivedEvent<PlayCardMessage>>(EventPriority.Normal, this, CardPlayed);
    }

    protected internal override void GameLoaded()
    {
        base.GameLoaded();

        _viewer.RegisterComponent<PlayableComponent>(TransformComponent);
    }

    public void MakePlayable(Card card, Seat owner, Action<TableItem?> playHandler)
    {
        MakePlayable(card, owner, playHandler, null);
    }

    /// <summary>
    /// Сделать карту играемой. Играемую карту можно "сыграть".
    /// Если нет цели, просто вытянуть из руки на центр экрана.
    /// Если цель есть, перетащить на доступный объект.
    /// </summary>
    /// <param name="card"></param>
    /// <param name="owner"></param>
    /// <param name="playHandler"></param>
    /// <param name="targets"></param>
    public void MakePlayable(Card card, Seat owner, Action<TableItem?> playHandler, params TableItem[]? targets)
    {
        PlayableComponent? existing = card.TryGetComponent<PlayableComponent>();

        if (existing != null)
        {
            RemoveComponentFromEntity(card, existing);
        }

        PlayableComponent playable = new(owner, targets, playHandler);

        AddComponentToEntity(card, playable);

        CardPlayabilityChangedMessage message = new(card, owner, targets);

        _communication.SendEntityRelated(message, card);
    }

    /// <summary>
    /// Убирает возможность сыграть карту.
    /// </summary>
    /// <param name="card"></param>
    public void MakeUnplayable(Card card)
    {
        PlayableComponent? component = card.TryGetComponent<PlayableComponent>();

        if (component == null)
        {
            // TODO warn?
            return;
        }

        RemoveComponentFromEntity(card, component);

        CardUnplayabilityMessage message = new(card);

        _communication.SendEntityRelated(message, card);
    }

    private void CardPlayed(ClientMessageReceivedEvent<PlayCardMessage> obj)
    {
        Card card = obj.Message.Card;

        PlayableComponent? component = card.TryGetComponent<PlayableComponent>();

        if (component == null)
        {
            // TODO warn
            return;
        }

        if (component.Owner != obj.Seat)
        {
            // TODO warn
            return;
        }

        if (component.Targets == null)
        {
            if (obj.Message.Target != null)
            {
                // TODO warn
                return;
            }
        }
        else if (!component.Targets.Contains(obj.Message.Target))
        {
            // TODO warn
            return;
        }

        component.PlayHandler(obj.Message.Target);
    }

    private PlayableComponentDto TransformComponent(PlayableComponent component, Seat? seat)
    {
        // TODO тут скрывать если не овнер?

        return new PlayableComponentDto(component);
    }
}