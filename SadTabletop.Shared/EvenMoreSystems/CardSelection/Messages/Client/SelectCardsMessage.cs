using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.EvenMoreSystems.CardSelection.Messages.Client;

public class SelectCardsMessage(CardSelectionData selection, int[] cards) : ClientMessageBase
{
    public CardSelectionData Selection { get; } = selection;

    // )
    public int[] Cards { get; } = cards;
}