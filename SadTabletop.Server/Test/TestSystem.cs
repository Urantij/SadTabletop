using SadTabletop.Shared;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.Systems.Assets;
using SadTabletop.Shared.Systems.Table;
using SadTabletop.Shared.Systems.Times;

namespace SadTabletop.Server.Test;

public class TestSystem : SystemBase
{
    private readonly TableSystem _table;
    private readonly TimesSystem _times;

    private Card? tempCard = null;

    private int _num = 4;

    private Card movingCard;

    public TestSystem(Game game) : base(game)
    {
    }

    protected override void GameCreated()
    {
        base.GameCreated();

        var assets = this.Game.GetSystem<AssetsSystem>();
        assets.AddCardAsset(4, "card4.png");
        assets.AddCardAsset(7, "card7.png");

        var cards = Game.GetSystem<CardsSystem>();

        movingCard = cards.Create(-200, -70, 4, 77, Flipness.Shown);

        cards.Create(1, 2, 55, 77, Flipness.Shown);
    }

    protected override void GameSetuped()
    {
        _times.RequestDelayedExecution(Execution1, TimeSpan.FromSeconds(5));

        _times.RequestDelayedExecution(MoveExecution, TimeSpan.FromSeconds(1));
    }

    public Card Create(float x, float y, int side)
    {
        var cards = Game.GetSystem<CardsSystem>();

        return cards.Create(x, y, side, 77, Flipness.Shown);
    }

    private void MoveExecution()
    {
        if (movingCard.X == -200)
        {
            _table.MoveItem(movingCard, 200, -70);
        }
        else
        {
            _table.MoveItem(movingCard, -200, -70);
        }
        
        _times.RequestDelayedExecution(MoveExecution, TimeSpan.FromSeconds(1));
    }

    private void Execution1()
    {
        _num = _num == 4 ? 7 : 4;

        tempCard = Create(100, 100, _num);

        _times.RequestDelayedExecution(Execution2, TimeSpan.FromSeconds(5));
    }

    private void Execution2()
    {
        _table.RemoveEntity(tempCard);
        tempCard = null;

        _times.RequestDelayedExecution(Execution1, TimeSpan.FromSeconds(5));
    }
}