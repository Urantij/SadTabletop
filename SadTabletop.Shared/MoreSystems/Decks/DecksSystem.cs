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

    /// <summary>
    /// Создаёт колоду с картами внутри. Принимает инфу о картах, создаёт ентити кард без сообщений, и кладёт их в колоду.
    /// </summary>
    /// <param name="x"></param>
    /// <param name="y"></param>
    /// <param name="flipness"></param>
    /// <param name="infos"></param>
    /// <returns></returns>
    public Deck Create(float x, float y, Flipness flipness, List<DeckCardInfo> infos)
    {
        List<Card> cards = infos
            .Select(info => _cards.Create(x, y, info.Front, info.Back, flipness, sendRelatedMessage: false))
            .ToList();

        Deck deck = new(cards)
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
        Card? pastDisplayedCard = deck.GetDisplayedCard();

        _table.RemoveEntity(card, sendRelatedMessage: false);
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
                    side = deck.Flipness == Flipness.Shown ? displayedCard.FrontSide : displayedCard.BackSide;
                }

                // Если клиент знает, какие карты в колоде, но не знает, какую карту положили, ему нужно рассказать
                CardFaceComplicated? cardFront = null;
                if (deck.ContentViewers?.Included(seat) == true || deck.OrderedContentViewers?.Included(seat) == true)
                {
                    if (card.Flipness == Flipness.Hidden || _limit.IsLimitedFor(card, seat))
                    {
                        cardFront = card.FrontSide;
                    }
                }

                int? index = null;
                if (deck.OrderedContentViewers?.Included(seat) == true)
                {
                    index = cardDeckIndex;
                }

                DeckCardInsertedMessage message = new(deck, card, side, cardFront, index);

                _communication.Send(message, seat);
            }
        }
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

        _table.ChangeEntityId(card);

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
                        side = displayedCard?.FrontSide;
                    }
                }
                else
                {
                    side = displayedCard?.BackSide;
                }

                int? index = null;
                if (deck.OrderedContentViewers?.Included(seat) == true)
                {
                    index = deckIndex;
                }

                ViewedEntity cardToSend = _synchro.ViewEntity(card, seat);

                CardFaceComplicated? cardFront = null;
                if (index == null && (cardToSend.Entity as CardDto)?.FrontSide == null &&
                    deck.ContentViewers?.Included(seat) == true)
                {
                    cardFront = card.FrontSide;
                }

                DeckCardRemovedMessage message = new(deck, cardToSend, side, cardFront, index);
                _communication.Send(message, seat);
            }
            else
            {
                EntityAddedMessage message = new(_synchro.ViewEntity(card, seat));

                _communication.Send(message, seat);
            }
        }

        return card;
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
            // TODO не хо4у ща думать
            throw new NotImplementedException();
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
        IReadOnlyCollection<DeckCardInfo>? cards = GetCardsInfo(deck, target);

        Card? displayedCard = deck.GetDisplayedCard();

        CardFaceComplicated? side = null;
        if (deck.Flipness == Flipness.Hidden)
        {
            side = displayedCard?.BackSide;
        }
        else
        {
            if (!_limit.IsLimitedFor(deck, target))
            {
                side = displayedCard?.FrontSide;
            }
        }

        return new DeckDto(deck, side, cards);
    }

    /// <summary>
    /// Расточительно на каждый чих отправлять всё. Но мне впадву. TODO
    /// </summary>
    private DeckUpdatedMessage FormUpdateMessage(Deck deck, Seat? seat)
    {
        IReadOnlyCollection<DeckCardInfo>? cards = GetCardsInfo(deck, seat);

        Card? displayedCard = deck.GetDisplayedCard();

        CardFaceComplicated? side = null;
        if (deck.Flipness == Flipness.Hidden)
        {
            side = displayedCard?.BackSide;
        }
        else
        {
            if (!_limit.IsLimitedFor(deck, seat))
            {
                side = displayedCard?.FrontSide;
            }
        }

        bool orderKnown = deck.OrderedContentViewers?.Included(seat) == true;

        return new DeckUpdatedMessage(deck, side, deck.Cards.Count, cards, orderKnown);
    }

    private IReadOnlyCollection<DeckCardInfo>? GetCardsInfo(Deck deck, Seat? target)
    {
        if (deck.OrderedContentViewers?.Included(target) == true)
        {
            return deck.Cards
                .Select(card => new DeckCardInfo(card.BackSide, card.FrontSide))
                .ToArray();
        }

        if (deck.ContentViewers?.Included(target) == true)
        {
            // Это не игромехан, так что юзать систему рандома не стоит.

            DeckCardInfo[] result = deck.Cards
                .Select(card => new DeckCardInfo(card.BackSide, card.FrontSide))
                .ToArray();

            Random.Shared.Shuffle(result);

            return result;
        }

        return null;
    }
}