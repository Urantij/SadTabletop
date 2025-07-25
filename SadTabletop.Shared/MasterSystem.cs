using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Decks;
using SadTabletop.Shared.MoreSystems.Dices;

namespace SadTabletop.Shared;

/// <summary>
/// Просто система, которая держит в себе релевантные при создании игры системы.
/// Чтобы не заказывать их всех по одной.
/// </summary>
public class MasterSystem : SystemBase
{
    public CardsSystem Cards { get; }
    public DecksSystem Decks { get; }
    public DicesSystem Dices { get; }

    public MasterSystem(Game game) : base(game)
    {
    }
}