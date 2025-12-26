using SadTabletop.Shared.MoreSystems.Cards;

namespace SadTabletop.Shared.MoreSystems.Decks;

/// <summary>
/// Сокращенное представление о карте для клиента.
/// </summary>
/// <param name="front"></param>
/// <param name="back"></param>
public class CardInfo(int id, CardFaceComplicated front, CardFaceComplicated back) : ICard
{
    // я думал много об этом, и все свои рассуждения писать мне лень.
    // если кратко, можно без этого и БЕЗ сравнения рубашек для идентификации, но там пара моментов есть спорных.
    public int Id { get; internal set; } = id;
    public CardFaceComplicated Front { get; } = front;
    public CardFaceComplicated Back { get; } = back;

    public static CardInfo FromCard(Card card)
    {
        return new CardInfo(card.Id, card.Front, card.Back);
    }
}