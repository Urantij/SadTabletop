using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.MoreSystems.Cards.Messages.Server;

/// <summary>
/// Сообщение, что карта перевернулась.
/// </summary>
public class CardFlippedMessage(Card card, int? frontSide) : ServerMessageBase
{
    /// <summary>
    /// Ентити, которую перевернули.
    /// </summary>
    public Card Card { get; } = card;

    /// <summary>
    /// Информация о лицевой стороне карты, если не была известна.
    /// </summary>
    public int? FrontSide { get; } = frontSide;
}