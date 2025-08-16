using SadTabletop.Shared;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Table;
using SadTabletop.Shared.Systems.Times;

namespace SadTabletop.Server.Test;

public class TestSystem : SystemBase
{
    private readonly TableSystem _table;
    private readonly TimesSystem _times;

    private Card? tempCard = null;

    public TestSystem(Game game) : base(game)
    {
    }

    protected override void GameCreated()
    {
        base.GameCreated();

        var cards = Game.GetSystem<CardsSystem>();

        cards.Create(1, 2, 55, 77, Flipness.Shown);
    }

    protected override void GameSetuped()
    {
        _times.RequestDelayedExecution(Execution1, TimeSpan.FromSeconds(5));
    }

    public Card Create(float x, float y)
    {
        var cards = Game.GetSystem<CardsSystem>();

        return cards.Create(x, y, 55, 77, Flipness.Shown);
    }

    private void Execution1()
    {
        tempCard = Create(100, 100);
        
        _times.RequestDelayedExecution(Execution2, TimeSpan.FromSeconds(5));
    }

    private void Execution2()
    {
        _table.RemoveEntity(tempCard);
        tempCard = null;
        
        _times.RequestDelayedExecution(Execution1, TimeSpan.FromSeconds(5));
    }
}