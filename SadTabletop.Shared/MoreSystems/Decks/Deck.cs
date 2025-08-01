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
    List<DeckCardInfo> cards,
    Spisok<Seat?>? orderedContentViewers = null,
    Spisok<Seat?>? contentViewers = null) : TableItem, ILimitable
{
    public int? BackSide { get; internal set; }
    public int? FrontSide { get; internal set; }

    public Flipness Flipness { get; internal set; }

    /// <summary>
    /// В коллекции карты лежат так, что 0 показывает лицо, а последняя рубашку
    /// </summary>
    public List<DeckCardInfo> Cards { get; } = cards;

    /// <summary>
    /// Те, кто могут видеть все карты в колоде в правильном порядке.
    /// </summary>
    public Spisok<Seat?>? OrderedContentViewers { get; } = orderedContentViewers;

    /// <summary>
    /// Те, кто могут видеть все карты в колоде, но в неизвестном порядке.
    /// </summary>
    public Spisok<Seat?>? ContentViewers { get; } = contentViewers;

    /// <summary>
    /// Возвращает рубашку и лицо колоды, основываясь на текущем наборе карт.
    /// </summary>
    /// <returns></returns>
    public (int back, int front)? CalculateSides()
    {
        if (Cards.Count == 0)
            return null;

        return (Cards.Last().BackSide, Cards.First().FrontSide);
    }
}

public class DeckDto(Deck deck, int? frontSide, IReadOnlyCollection<DeckCardInfo>? cards) : TableItemDto(deck)
{
    public int? BackSide { get; } = deck.BackSide;
    public int? FrontSide { get; } = frontSide;

    public Flipness Flipness { get; } = deck.Flipness;

    public IReadOnlyCollection<DeckCardInfo>? Cards { get; } = cards;
}