using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Decks.Messages;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Limit;
using SadTabletop.Shared.Systems.Limit.Events;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Table;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.MoreSystems.Decks;

/// <summary>
/// Колоды
/// </summary>
public class DecksSystem : SystemBase
{
    private readonly EventsSystem _events;
    private readonly LimitSystem _limit;
    private readonly ViewerSystem _viewer;

    private readonly TableSystem _table;
    private readonly SeatsSystem _seats;
    private readonly CommunicationSystem _communication;

    private readonly CardsSystem _cards;

    public DecksSystem(Game game) : base(game)
    {
    }

    protected internal override void GameCreated()
    {
        base.GameCreated();

        _events.Subscribe<LimitedEvent>(EventPriority.Normal, this, Limited);
    }

    protected internal override void GameLoaded()
    {
        base.GameLoaded();

        _viewer.RegisterEntity<Deck>(TransformDeck);
    }

    /// <summary>
    /// "Кладёт" карту в колоду. Ентити карты при этом уничтожается.
    /// </summary>
    /// <param name="deck"></param>
    /// <param name="card"></param>
    /// <param name="way"></param>
    public void PutCard(Deck deck, Card card, DeckWay way)
    {
        int back = card.BackSide;
        int front = card.FrontSide;

        _table.RemoveEntity(card);

        PutNewCard(deck, front, back, way);
    }

    public void PutNewCard(Deck deck, int front, int back, DeckWay way)
    {
        DeckCardInfo info = new(back, front);

        if (way == DeckWay.Front)
        {
            deck.Cards.Insert(0, info);
        }
        else if (way == DeckWay.Back)
        {
            deck.Cards.Add(info);
        }
        else if (way == DeckWay.Random)
        {
            // TODO не хо4у ща думать
            throw new NotImplementedException();
        }
        else
        {
            throw new Exception($"Неизвестный путь деквей {way}");
        }

        foreach (Seat? seat in _seats.EnumerateSeats())
        {
            DeckUpdatedMessage message = FormUpdateMessage(deck, seat);

            _communication.SendEntityRelated(message, deck);
        }
    }

    /// <summary>
    /// Достаёт карту с верха колоды.
    /// Если колода пустая, кидает ексепшн.
    /// Фактически создаёт ентити карты.
    /// </summary>
    /// <param name="deck"></param>
    /// <param name="x"></param>
    /// <param name="y"></param>
    /// <param name="flipness"></param>
    public Card GetCard(Deck deck, float x, float y, Flipness flipness)
    {
        if (deck.Cards.Count == 0)
            throw new Exception("Колода пустая брух");

        DeckCardInfo cardInfo;

        if (deck.Flipness == Flipness.Shown)
        {
            cardInfo = deck.Cards[0];
            deck.Cards.RemoveAt(0);
        }
        else
        {
            cardInfo = deck.Cards.Last();
            deck.Cards.RemoveAt(deck.Cards.Count - 1);
        }

        foreach (Seat? seat in _seats.EnumerateSeats())
        {
            DeckUpdatedMessage message = FormUpdateMessage(deck, seat);
            _communication.SendEntityRelated(message, deck, seat);
        }

        return _cards.Create(x, y, cardInfo.FrontSide, cardInfo.BackSide, flipness);
    }

    private void Limited(LimitedEvent obj)
    {
        if (obj.Entity is not Deck deck)
            return;

        if (obj.TheyKnowNow != null)
        {
            foreach (Seat? seat in obj.TheyKnowNow)
            {
                DeckUpdatedMessage message = FormUpdateMessage(deck, seat);

                _communication.SendEntityRelated(message, deck, seat);
            }
        }

        if (obj.TheyDontKnowNow != null)
        {
            foreach (Seat? seat in obj.TheyDontKnowNow)
            {
                DeckUpdatedMessage message = FormUpdateMessage(deck, seat);

                _communication.SendEntityRelated(message, deck, seat);
            }
        }
    }

    private object TransformDeck(Deck deck, Seat? target)
    {
        int? frontside = _limit.IsLimitedFor(deck, target) ? null : deck.FrontSide;

        IReadOnlyCollection<DeckCardInfo>? cards = GetCardsInfo(deck, target);

        return new
        {
            deck.Id,
            deck.X,
            deck.Y,
            deck.Flipness,
            deck.BackSide,
            FrontSide = frontside,
            Cards = cards,
        };
    }

    /// <summary>
    /// Расточительно на каждый чих отправлять всё. Но мне впадву. TODO
    /// </summary>
    private DeckUpdatedMessage FormUpdateMessage(Deck deck, Seat? seat)
    {
        IReadOnlyCollection<DeckCardInfo>? cards = GetCardsInfo(deck, seat);

        int? frontValue = _limit.IsLimitedFor(deck, seat) ? null : deck.FrontSide;

        return new DeckUpdatedMessage(deck, deck.BackSide, frontValue, deck.Cards.Count, cards,
            deck.OrderedContentViewers?.Included(seat) == true);
    }

    private IReadOnlyCollection<DeckCardInfo>? GetCardsInfo(Deck deck, Seat? target)
    {
        if (deck.OrderedContentViewers?.Included(target) == true)
        {
            return deck.Cards.ToArray();
        }

        if (deck.ContentViewers?.Included(target) == true)
        {
            // Это не игромехан, так что юзать систему рандома не стоит.

            DeckCardInfo[] result = deck.Cards.ToArray();

            Random.Shared.Shuffle(result);

            return result;
        }

        return null;
    }
}