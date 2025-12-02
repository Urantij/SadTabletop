using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.MoreSystems.Cards.Messages.Server;

/// <summary>
/// Сообщение, что карта перевернулась.
/// </summary>
public class CardFlippedMessage(Card card, CardFaceComplicated? front) : ServerMessageBase
{
    /// <summary>
    /// Ентити, которую перевернули.
    /// </summary>
    public Card Card { get; } = card;

    /// <summary>
    /// Информация о лицевой стороне карты, если не была известна.
    /// </summary>
    public CardFaceComplicated? FrontSide { get; } = front;
}