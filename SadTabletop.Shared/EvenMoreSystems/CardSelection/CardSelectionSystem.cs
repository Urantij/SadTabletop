using SadTabletop.Shared.EvenMoreSystems.CardSelection.Messages.Client;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Decks;
using SadTabletop.Shared.Systems.Communication.Events;
using SadTabletop.Shared.Systems.Entities;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Visability;

namespace SadTabletop.Shared.EvenMoreSystems.CardSelection;

// я думал либо создать интерфейс ICard либо хранить обжекты. как будто бы первое лишнее снаружи, второе лишнее внутри
// хызы

/// <summary>
/// Позволяет показывать игрокам набор карт и заставлять их выбирать из них.
/// </summary>
public class CardSelectionSystem : EntitiesSystem<CardSelectionData>
{
    private readonly VisabilitySystem _visability;

    public CardSelectionSystem(Game game) : base(game)
    {
    }

    protected internal override void GameCreated()
    {
        base.GameCreated();

        Game.GetSystem<EventsSystem>()
            .Subscribe<ClientMessageReceivedEvent<SelectCardsMessage>>(EventPriority.Normal, this, CardsSelected);
    }

    public void MakeSelection(Seat target, int min, int max, IReadOnlyList<ICard> cards, Action<ICard[]> handler)
    {
        CardInfo[] clientCardsData = cards
            .Select((c, index) => new CardInfo(index, c.Front, c.Back))
            .ToArray();

        CardSelectionData data = new(target, min, max, cards, clientCardsData, handler);

        _visability.HideFromEveryoneExcept(data, target, sendRelatedMessage: false);

        AddEntity(data);
    }

    private void CardsSelected(ClientMessageReceivedEvent<SelectCardsMessage> ev)
    {
        CardSelectionData data = ev.Message.Selection;

        if (data.Target != ev.Seat)
        {
            // TODO сделать што то
            return;
        }

        if (ev.Message.Cards.Distinct().Count() != ev.Message.Cards.Length)
        {
            // TODO сделать што то
            return;
        }

        if (ev.Message.Cards.Any(c => c < 0 || c >= data.ClientCardsData.Length))
        {
            // TODO сделать што то
            return;
        }

        ICard[] result = ev.Message.Cards
            .Select(c => data.Cards[c])
            .ToArray();

        // TODO нужно посылать сообщение?
        RemoveEntity(data);

        data.Handler(result);
    }
}