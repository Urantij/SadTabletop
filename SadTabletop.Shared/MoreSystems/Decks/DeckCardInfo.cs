namespace SadTabletop.Shared.MoreSystems.Decks;

public class DeckCardInfo(int backSide, int frontSide)
{
    public int BackSide { get; } = backSide;
    public int FrontSide { get; } = frontSide;
}