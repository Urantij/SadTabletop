using SadTabletop.Shared.MoreSystems.Cards;

namespace SadTabletop.Shared.MoreSystems.Decks;

/// <summary>
/// Представление о карте в деке для клиента.
/// </summary>
/// <param name="back"></param>
/// <param name="front"></param>
public class DeckCardInfo(CardFaceComplicated back, CardFaceComplicated front)
{
    public CardFaceComplicated Back { get; } = back;
    public CardFaceComplicated Front { get; } = front;
}