using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Limit;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.MoreSystems.Decks;

/// <summary>
/// Колода карт.
/// Может иметь ноль карт в себе. Колода это место, где группируются карты. Место может быть пустым.
/// Карты внутри колоды не существуют как <see cref="Card"/> ентити. Колода хранит их фронт и бек, всё.
/// Так что когда карта кладётся в колоду, её ентити уничтожается. И когда достаётся из колоды, создаётся.
/// </summary>
public class Deck(
    List<Card> cards,
    Spisok<Seat?>? orderedContentViewers,
    Spisok<Seat?>? contentViewers) : TableItem, ILimitable
{
    public Flipness Flipness { get; internal set; }

    /// <summary>
    /// В коллекции карты лежат так, что 0 показывает лицо, а последняя рубашку
    /// </summary>
    public List<Card> Cards { get; } = cards;

    /// <summary>
    /// Те, кто могут видеть все карты в колоде в правильном порядке.
    /// </summary>
    public Spisok<Seat?>? OrderedContentViewers { get; } = orderedContentViewers;

    /// <summary>
    /// Те, кто могут видеть все карты в колоде, но в неизвестном порядке.
    /// </summary>
    public Spisok<Seat?>? ContentViewers { get; } = contentViewers;

    /// <summary>
    /// Карта, которую сейчас видно в деке
    /// </summary>
    /// <returns></returns>
    public Card? GetDisplayedCard()
    {
        if (Cards.Count == 0)
            return null;

        if (Flipness == Flipness.Shown)
        {
            return Cards.First();
        }
        else if (Flipness == Flipness.Hidden)
        {
            return Cards.Last();
        }
        else
        {
            throw new Exception($"че блять {nameof(GetDisplayedCard)}");
        }
    }

    // /// <summary>
    // /// Возвращает рубашку и лицо колоды, основываясь на текущем наборе карт.
    // /// </summary>
    // /// <returns></returns>
    // public (CardFaceComplicated back, CardFaceComplicated front)? CalculateSides()
    // {
    //     if (Cards.Count == 0)
    //         return null;
    //
    //     return (Cards.Last().BackSide, Cards.First().FrontSide);
    // }
}

public class DeckDto(
    Deck deck,
    CardFaceComplicated? side,
    IReadOnlyCollection<CardInfo>? cards)
    : TableItemDto(deck)
{
    /// <summary>
    /// Если ты знаешь лицо деки, это не значит, что ты знаешь её рубашку. Поэтому даём информацию только о том, что мы видим.
    /// У карты же если ты знаешь лицо, то ты знаешь и рубашку.
    /// </summary>
    public CardFaceComplicated? Side { get; } = side;

    public Flipness Flipness { get; } = deck.Flipness;

    public int CardsCount { get; } = deck.Cards.Count;
    public IReadOnlyCollection<CardInfo>? Cards { get; } = cards;

    public override Type WhatIsMyType() => typeof(Deck);
}