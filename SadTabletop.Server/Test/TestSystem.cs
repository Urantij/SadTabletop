using SadTabletop.Shared;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;

namespace SadTabletop.Server.Test;

public class TestSystem : SystemBase
{
    public TestSystem(Game game) : base(game)
    {
    }

    protected override void GameCreated()
    {
        base.GameCreated();

        var cards = Game.GetSystem<CardsSystem>();

        cards.Create(1, 2, 55, 77, Flipness.Shown);
    }
}