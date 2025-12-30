using SadTabletop.Shared.EvenMoreSystems.Playable.Messages.Client;
using SadTabletop.Shared.EvenMoreSystems.Playable.Messages.Server;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Decks.Events;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Communication.Events;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Table;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.EvenMoreSystems.Playable;

/// <summary>
/// Позволяет делать карты в "руке" игроков играюищимися.
/// Если карта кладётся в деку, она перестает быть играемой.
/// </summary>
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

        Game.GetSystem<EventsSystem>().Subscribe<CardAddingToDeckEvent>(EventPriority.Normal, this, CardAddingToDeck);
        _events.Subscribe<ClientMessageReceivedEvent<PlayCardMessage>>(EventPriority.Normal, this, CardPlayed);
    }

    protected internal override void GameLoaded()
    {
        base.GameLoaded();

        _viewer.RegisterComponent<PlayableComponent>(TransformComponent);
    }

    public void MakePlayable(Card card, Seat owner, Action<TableItem?> playHandler, bool singleUse = true)
    {
        MakePlayable(card, owner, playHandler, null, singleUse: singleUse);
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
    /// <param name="singleUse"></param>
    public void MakePlayable(Card card, Seat owner, Action<TableItem?> playHandler, TableItem[]? targets,
        bool singleUse = true)
    {
        PlayableComponent? existing = card.TryGetComponent<PlayableComponent>();

        if (existing != null)
        {
            RemoveComponentFromEntity(card, existing);
        }

        PlayableComponent playable = new(owner, targets, playHandler, singleUse);

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

        RemovePlayability(card, component);
    }

    private void CardAddingToDeck(CardAddingToDeckEvent obj)
    {
        PlayableComponent? component = obj.Card.TryGetComponent<PlayableComponent>();

        if (component == null)
            return;

        RemovePlayability(obj.Card, component, sendRelatedMessages: false);
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

        if (component.SingleUse)
        {
            // TODO а другая херня сообщает сингл юз клиентам и они сами короче да
            RemovePlayability(card, component);
        }

        component.PlayHandler(obj.Message.Target);
    }

    private void RemovePlayability(Card card, PlayableComponent component, bool sendRelatedMessages = true)
    {
        RemoveComponentFromEntity(card, component);

        if (sendRelatedMessages)
        {
            CardUnplayabilityMessage message = new(card);
            _communication.SendEntityRelated(message, card);
        }
    }

    private PlayableComponentDto TransformComponent(PlayableComponent component, Seat? seat)
    {
        // TODO тут скрывать если не овнер?

        return new PlayableComponentDto(component);
    }
}