using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Decks.Messages;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Limit;
using SadTabletop.Shared.Systems.Limit.Events;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Synchro;
using SadTabletop.Shared.Systems.Synchro.Messages;
using SadTabletop.Shared.Systems.Table;
using SadTabletop.Shared.Systems.Viewer;
using SadTabletop.Shared.Systems.Visability;

namespace SadTabletop.Shared.MoreSystems.Decks;

/// <summary>
/// Колоды
/// </summary>
public class DecksSystem : SystemBase
{
    private readonly EventsSystem _events;
    private readonly SynchroSystem _synchro;
    private readonly VisabilitySystem _visability;
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

    public Deck Create(float x, float y, Flipness flipness, List<DeckCardInfo> cards)
    {
        Deck deck = new(cards)
        {
            Flipness = flipness,
            X = x,
            Y = y,
        };
        (int back, int front)? sides = deck.CalculateSides();
        deck.FrontSide = sides?.front;
        deck.BackSide = sides?.back;

        _table.AddEntity(deck);

        return deck;
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

        int? pastDeckFront = deck.FrontSide;
        int? pastDeckBack = deck.BackSide;

        _table.RemoveEntity(card, sendRelatedMessage: false);
        DeckCardInfo deckCardInfo = AddCardToDeckLocally(deck, front, back, way);

        int deckIndex = deck.Cards.IndexOf(deckCardInfo);

        // TODO много оптимизаций придумать можно

        // Если клиент не видит карту, но видит деку, нужно обновить деку.
        // Если клиент не видит деку, но видит карту, нужно удалить карту
        // Если клиент видит и деку, и карту, то нужно сообщить о инсерте
        // Если клиент должен знать новое лицо деки, и он его не знал, его нужно подложить в сообщение

        foreach (Seat? seat in _seats.EnumerateAllSeats())
        {
            bool deckVisible = _visability.IsVisibleFor(deck, seat);
            bool cardVisible = _visability.IsVisibleFor(card, seat);

            if (!deckVisible && !cardVisible)
                continue;

            if (!cardVisible && deckVisible)
            {
                DeckUpdatedMessage message = FormUpdateMessage(deck, seat);

                _communication.Send(message, seat);
            }
            else if (cardVisible && !deckVisible)
            {
                EntityRemovedMessage message = new(card);

                _communication.Send(message, seat);
            }
            else
            {
                // все видны

                int? side = null;
                if (deck.Flipness == Flipness.Shown)
                {
                    if (deck.FrontSide != pastDeckFront && !_limit.IsLimitedFor(deck, seat))
                    {
                        side = deck.FrontSide;
                    }
                }
                else
                {
                    if (deck.BackSide != pastDeckBack)
                    {
                        side = deck.BackSide;
                    }
                }

                int? cardFront = null;
                if (card.Flipness == Flipness.Hidden || _limit.IsLimitedFor(card, seat))
                {
                    cardFront = card.FrontSide;
                }

                int? index = null;
                if (deck.OrderedContentViewers?.Included(seat) == true)
                {
                    index = deckIndex;
                }

                DeckCardInsertedMessage message = new(deck, card, side, cardFront, index);

                _communication.Send(message, seat);
            }
        }
    }

    /// <summary>
    /// Добавляет карту в колоду без создания ентити карты
    /// </summary>
    /// <param name="deck"></param>
    /// <param name="front"></param>
    /// <param name="back"></param>
    /// <param name="way"></param>
    public void PutNewCard(Deck deck, int front, int back, DeckWay way)
    {
        AddCardToDeckLocally(deck, front, back, way);

        foreach (Seat? seat in _seats.EnumerateAllSeats())
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

        int deckIndex;
        if (deck.Flipness == Flipness.Shown)
        {
            deckIndex = 0;
        }
        else
        {
            deckIndex = deck.Cards.Count - 1;
        }

        int? pastDeckFront = deck.FrontSide;
        int? pastDeckBack = deck.BackSide;

        DeckCardInfo cardInfo = deck.Cards[deckIndex];
        deck.Cards.RemoveAt(deckIndex);

        (int back, int front)? sides = deck.CalculateSides();
        deck.FrontSide = sides?.front;
        deck.BackSide = sides?.back;

        Card createdCard =
            _cards.Create(x, y, cardInfo.FrontSide, cardInfo.BackSide, flipness, sendRelatedMessage: false);

        // Если клиент видит колоду, нужно для него достать карту.
        // Если клиент не видит, нужно карту просто заспавнить.

        foreach (Seat? seat in _seats.EnumerateAllSeats())
        {
            bool deckVisible = _visability.IsVisibleFor(deck, seat);

            if (deckVisible)
            {
                // TODO тупо скопировал, нужно вынести куда то
                int? side = null;
                if (deck.Flipness == Flipness.Shown)
                {
                    if (deck.FrontSide != pastDeckFront && !_limit.IsLimitedFor(deck, seat))
                    {
                        side = deck.FrontSide;
                    }
                }
                else
                {
                    if (deck.BackSide != pastDeckBack)
                    {
                        side = deck.BackSide;
                    }
                }

                int? index = null;
                if (deck.OrderedContentViewers?.Included(seat) == true)
                {
                    index = deckIndex;
                }

                DeckCardRemovedMessage message = new(deck, _synchro.ViewEntity(createdCard, seat), side, index);
                _communication.Send(message, seat);
            }
            else
            {
                EntityAddedMessage message = new(_synchro.ViewEntity(createdCard, seat));

                _communication.Send(message, seat);
            }
        }

        return createdCard;
    }

    /// <summary>
    /// Добавляет карту без сообщения
    /// </summary>
    private DeckCardInfo AddCardToDeckLocally(Deck deck, int front, int back, DeckWay way)
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

        (int back, int front)? sides = deck.CalculateSides();
        deck.FrontSide = sides?.front;
        deck.BackSide = sides?.back;

        return info;
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

    private DeckDto TransformDeck(Deck deck, Seat? target)
    {
        int? frontside = _limit.IsLimitedFor(deck, target) ? null : deck.FrontSide;

        IReadOnlyCollection<DeckCardInfo>? cards = GetCardsInfo(deck, target);

        return new DeckDto(deck, frontside, deck.Cards.Count, cards);
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