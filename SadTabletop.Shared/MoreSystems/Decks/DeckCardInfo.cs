using SadTabletop.Shared.MoreSystems.Cards;

namespace SadTabletop.Shared.MoreSystems.Decks;

/// <summary>
/// Представление о карте в деке для клиента.
/// </summary>
/// <param name="back"></param>
/// <param name="front"></param>
public class DeckCardInfo(int id, CardFaceComplicated back, CardFaceComplicated front)
{
    // я думал много об этом, и все свои рассуждения писать мне лень.
    // если кратко, можно без этого и БЕЗ сравнения рубашек для идентификации, но там пара моментов есть спорных.
    public int Id { get; internal set; } = id;
    public CardFaceComplicated Back { get; } = back;
    public CardFaceComplicated Front { get; } = front;
}