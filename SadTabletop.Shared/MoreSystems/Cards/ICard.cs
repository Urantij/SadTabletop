using SadTabletop.Shared.MoreSystems.Decks;

namespace SadTabletop.Shared.MoreSystems.Cards;

/// <summary>
/// что то типа карты
/// <see cref="CardInfo"/> и <see cref="Card"/>
/// </summary>
public interface ICard
{
    public int Id { get; }
    public CardFaceComplicated Front { get; }
    public CardFaceComplicated Back { get; }
}