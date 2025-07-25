using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.MoreSystems.Decks.Messages;

public class DeckUpdatedMessage(
    Deck deck,
    int? backSide,
    int? frontSide,
    int cardsCount,
    IReadOnlyCollection<DeckCardInfo>? cards,
    bool? orderKnown) : ServerMessageBase
{
    public Deck Deck { get; } = deck;

    public int? BackSide { get; } = backSide;
    public int? FrontSide { get; } = frontSide;

    // В теории можно не отправлять, если есть коллекция, но фиг с ним.
    public int CardsCount { get; } = cardsCount;

    /// <summary>
    /// Список карт, если известен. Если порядок случайный, коллекция уже должна быть зашафлена.
    /// </summary>
    public IReadOnlyCollection<DeckCardInfo>? Cards { get; } = cards;

    /// <summary>
    /// null = коллекции нет. false = порядок случайный. ...
    /// Стоило сделать, но какой смысл? Просто тру - ордеред, а остальное неважно.
    /// </summary>
    public bool? OrderKnown { get; } = orderKnown;
}