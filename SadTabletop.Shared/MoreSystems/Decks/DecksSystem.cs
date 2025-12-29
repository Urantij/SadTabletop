using SadTabletop.Shared.Helps;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Decks.Events;
using SadTabletop.Shared.MoreSystems.Decks.Messages;
using SadTabletop.Shared.MoreSystems.Hands;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Events;
using SadTabletop.Shared.Systems.Limit;
using SadTabletop.Shared.Systems.Limit.Events;
using SadTabletop.Shared.Systems.MyRandom;
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

    private readonly RandomSystem _random;

    private readonly TableSystem _table;
    private readonly SeatsSystem _seats;
    private readonly CommunicationSystem _communication;

    private readonly CardsSystem _cards;

    private readonly HandsSystem _hands;

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
    /// Создаёт колоду с картами внутри. Принимает инфу о картах, создаёт ентити кард без сообщений, и кладёт их в колоду.
    /// </summary>
    /// <param name="x"></param>
    /// <param name="y"></param>
    /// <param name="flipness"></param>
    /// <param name="infos">айдишники ставить не надо, в системе поменяются на случайные</param>
    /// <param name="contentViewers"></param>
    /// <param name="orderedContentViewers"></param>
    /// <returns></returns>
    public Deck Create(float x, float y, Flipness flipness, List<CardInfo> infos,
        Spisok<Seat?>? contentViewers = null, Spisok<Seat?>? orderedContentViewers = null)
    {
        // если просто поставить айди от 0 до Count и зашафлить, то с клиента будет видно, что это ток что созданная дека
        // так как при добавлении карт айди по другому работает...

        // TODO тут всё равно или нужен ингейм рандомер? мне каж наоборот не нужен

        // List<Card> cards = infos
        //     .Select((info, index) =>
        //     {
        //         Card card = _cards.Create(x, y, info.Front, info.Back, flipness, sendRelatedMessage: false);
        //
        //         _table.SetEntityId(card, index);
        //
        //         return card;
        //     })
        //     .OrderBy(_ => Random.Shared.Next())
        //     .ToList();
        List<Card> cards = infos
            .Select(info =>
            {
                // кансер
                Card card = _cards.Create(x, y, info.Front, info.Back, flipness, sendRelatedMessage: false);

                _table.RemoveEntity(card, sendRelatedMessage: false);

                return card;
            })
            .ToList();

        cards.NonRepeatedRandomAssign((c, i) => _table.SetEntityId(c, i));

        Deck deck = new(cards, orderedContentViewers, contentViewers)
        {
            Flipness = flipness,
            X = x,
            Y = y,
        };

        _table.AddEntity(deck);

        return deck;
    }

    /// <summary>
    /// "Кладёт" карту в колоду. Ентити карты при этом убирается со стола.
    /// </summary>
    /// <param name="deck"></param>
    /// <param name="card"></param>
    /// <param name="way"></param>
    public void PutCard(Deck deck, Card card, DeckWay way)
    {
        _events.Invoke(new CardAddingToDeckEvent(deck, card));

        Card? pastDisplayedCard = deck.GetDisplayedCard();

        _table.RemoveEntity(card, sendRelatedMessage: false);

        int cardDeckId = deck.Cards.NonRepeatedRandomGet(c => c.Id);
        int cardDeckIndex = AddCardToDeckLocally(deck, card, way);

        Card displayedCard = deck.GetDisplayedCard()!;

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
                // TODO тут можно поумнее чето придумать
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

                // TODO можно сравнивать не сами карты а их рубашки, если не изменилось
                CardFaceComplicated? side = null;
                if (pastDisplayedCard != displayedCard)
                {
                    side = deck.Flipness == Flipness.Shown ? displayedCard.Front : displayedCard.Back;
                }

                // Если клиент знает, какие карты в колоде, но не знает, какую карту положили, ему нужно рассказать
                CardFaceComplicated? cardFront = null;
                if (deck.ContentViewers?.Included(seat) == true || deck.OrderedContentViewers?.Included(seat) == true)
                {
                    if (card.Flipness == Flipness.Hidden || _limit.IsLimitedFor(card, seat))
                    {
                        cardFront = card.Front;
                    }
                }

                int? index = null;
                if (deck.OrderedContentViewers?.Included(seat) == true)
                {
                    index = cardDeckIndex;
                }

                DeckCardInsertedMessage message = new(deck, card, cardDeckId, side, cardFront, index);

                _communication.Send(message, seat);
            }
        }

        _table.SetEntityId(card, cardDeckId);
    }

    // /// <summary>
    // /// Добавляет карту в колоду без создания ентити карты
    // /// </summary>
    // /// <param name="deck"></param>
    // /// <param name="front"></param>
    // /// <param name="back"></param>
    // /// <param name="way"></param>
    // public void PutNewCard(Deck deck, int front, int back, DeckWay way)
    // {
    //     AddCardToDeckLocally(deck, front, back, way);
    //
    //     foreach (Seat? seat in _seats.EnumerateAllSeats())
    //     {
    //         DeckUpdatedMessage message = FormUpdateMessage(deck, seat);
    //
    //         _communication.SendEntityRelated(message, deck);
    //     }
    // }

    // TODO как будто это должно быть где то ещё
    /// <summary>
    /// Достаёт карту из колоды рубашкой вверх на позицию деки, переносит её в руку цели, флипает лицом вверх.
    /// </summary>
    /// <param name="deck"></param>
    /// <param name="card"></param>
    /// <param name="target"></param>
    public void DrawCard(Deck deck, Card card, Seat target)
    {
        GetCard(deck, card, deck.X, deck.Y, Flipness.Hidden);
        _hands.AddToHand(card, target);
        _cards.Flip(card, Flipness.Shown);
    }

    /// <summary>
    /// Достаёт карту из колоды и кладёт её лицом вверх поверх колоды.
    /// </summary>
    /// <param name="deck"></param>
    /// <param name="card"></param>
    /// <returns></returns>
    public void GetCard(Deck deck, Card card)
    {
        GetCard(deck, card, deck.X, deck.Y, Flipness.Shown);
    }

    /// <summary>
    /// Достаёт указанную карту из колоды и размещает её по указанным координатам
    /// </summary>
    /// <param name="deck"></param>
    /// <param name="card"></param>
    /// <param name="x"></param>
    /// <param name="y"></param>
    /// <param name="flipness"></param>
    /// <exception cref="Exception"></exception>
    public void GetCard(Deck deck, Card card, float x, float y, Flipness flipness)
    {
        if (!deck.Cards.Remove(card))
        {
            throw new Exception($"Попытка удалить карту {card.Id} из колоды {deck.Id} где её нет.");
        }

        _table.SetPosition(card, x, y);
        _cards.SetFlipness(card, flipness);

        ProcessRemovedFromDeckCard(deck, card);
    }

    /// <summary>
    /// Достаёт карту с верха колоды.
    /// Если колода пустая, кидает ексепшн.
    /// Флипнес карты будет равен флипнесу деки.
    /// </summary>
    /// <param name="deck"></param>
    /// <param name="x"></param>
    /// <param name="y"></param>
    /// <returns></returns>
    public Card GetCard(Deck deck, float x, float y)
        => GetCard(deck, x, y, deck.Flipness);

    /// <summary>
    /// Достаёт карту с верха колоды.
    /// Если колода пустая, кидает ексепшн.
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

        Card card = deck.Cards[deckIndex];
        deck.Cards.RemoveAt(deckIndex);

        card.X = x;
        card.Y = y;
        card.Flipness = flipness;

        ProcessRemovedFromDeckCard(deck, card);

        return card;
    }

    /// <summary>
    /// Уже удалённую карту из колоды анонсирует клиентам и меняет её айди ещё
    /// </summary>
    /// <param name="deck"></param>
    /// <param name="card"></param>
    private void ProcessRemovedFromDeckCard(Deck deck, Card card)
    {
        int removedCardDeckId = card.Id;

        _table.AddEntity(card, sendRelatedMessage: false);

        // TODO сравнивать сайды карты, не всегда отправлять.
        Card? displayedCard = deck.GetDisplayedCard();

        // Если клиент видит колоду, нужно для него достать карту.
        // Если клиент не видит, нужно карту просто заспавнить.

        foreach (Seat? seat in _seats.EnumerateAllSeats())
        {
            bool deckVisible = _visability.IsVisibleFor(deck, seat);

            if (deckVisible)
            {
                // TODO тупо скопировал, нужно вынести куда то
                CardFaceComplicated? side = null;
                if (deck.Flipness == Flipness.Shown)
                {
                    if (!_limit.IsLimitedFor(deck, seat))
                    {
                        side = displayedCard?.Front;
                    }
                }
                else
                {
                    side = displayedCard?.Back;
                }

                ViewedEntity cardToSend = _synchro.ViewEntity(card, seat);

                DeckCardRemovedMessage message = new(deck, cardToSend, side, removedCardDeckId);
                _communication.Send(message, seat);
            }
            else
            {
                EntityAddedMessage message = new(_synchro.ViewEntity(card, seat));

                _communication.Send(message, seat);
            }
        }
    }

    /// <summary>
    /// Добавляет карту без сообщения
    /// </summary>
    private int AddCardToDeckLocally(Deck deck, Card card, DeckWay way)
    {
        int index;

        if (way == DeckWay.Front)
        {
            index = 0;

            deck.Cards.Insert(index, card);
        }
        else if (way == DeckWay.Back)
        {
            deck.Cards.Add(card);

            index = deck.Cards.Count - 1;
        }
        else if (way == DeckWay.Random)
        {
            index = _random.Get(0, deck.Cards.Count);

            deck.Cards.Insert(index, card);
        }
        else
        {
            throw new Exception($"Неизвестный путь деквей {way}");
        }

        return index;
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
        IReadOnlyCollection<CardInfo>? cards = GetCardsInfo(deck, target);

        Card? displayedCard = deck.GetDisplayedCard();

        CardFaceComplicated? side = null;
        if (deck.Flipness == Flipness.Hidden)
        {
            side = displayedCard?.Back;
        }
        else
        {
            if (!_limit.IsLimitedFor(deck, target))
            {
                side = displayedCard?.Front;
            }
        }

        return new DeckDto(deck, side, cards);
    }

    /// <summary>
    /// Расточительно на каждый чих отправлять всё. Но мне впадву. TODO
    /// </summary>
    private DeckUpdatedMessage FormUpdateMessage(Deck deck, Seat? seat)
    {
        IReadOnlyCollection<CardInfo>? cards = GetCardsInfo(deck, seat);

        Card? displayedCard = deck.GetDisplayedCard();

        CardFaceComplicated? side = null;
        if (deck.Flipness == Flipness.Hidden)
        {
            side = displayedCard?.Back;
        }
        else
        {
            if (!_limit.IsLimitedFor(deck, seat))
            {
                side = displayedCard?.Front;
            }
        }

        bool orderKnown = deck.OrderedContentViewers?.Included(seat) == true;

        return new DeckUpdatedMessage(deck, side, deck.Cards.Count, cards, orderKnown);
    }

    private IReadOnlyCollection<CardInfo>? GetCardsInfo(Deck deck, Seat? target)
    {
        if (deck.OrderedContentViewers?.Included(target) == true)
        {
            return deck.Cards
                .Select(CardInfo.FromCard)
                .ToArray();
        }

        if (deck.ContentViewers?.Included(target) == true)
        {
            // Это не игромехан, так что юзать систему рандома не стоит.

            CardInfo[] result = deck.Cards
                .Select(CardInfo.FromCard)
                .ToArray();

            Random.Shared.Shuffle(result);

            return result;
        }

        return null;
    }
}