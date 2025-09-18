using SadTabletop.Shared;
using SadTabletop.Shared.Helps;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Hands;
using SadTabletop.Shared.MoreSystems.Shapes;
using SadTabletop.Shared.MoreSystems.Texts;
using SadTabletop.Shared.Systems.Assets;
using SadTabletop.Shared.Systems.Clicks;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Table;
using SadTabletop.Shared.Systems.Times;

namespace SadTabletop.Server.Test;

public class TestSystem : SystemBase
{
    private readonly TableSystem _table;
    private readonly TimesSystem _times;
    private readonly ClicksSystem _clicks;

    private Card? tempCard = null;

    private Card? contsCard = null;

    private int _num = 4;

    private Card movingCard;

    private int movedTimes = 0;

    public TestSystem(Game game) : base(game)
    {
    }

    protected override void GameCreated()
    {
        base.GameCreated();

        var seats = this.Game.GetSystem<SeatsSystem>();
        var hands = this.Game.GetSystem<HandsSystem>();
        // seats.AddSeat();
        // seats.AddSeat();
        // seats.AddSeat();

        this.Game.GetSystem<ShapesSystem>().AddCircle(0, 0, 500, 0x000033);
        seats.CreateRoundSeats(3, 0, 0, 500);

        var assets = this.Game.GetSystem<AssetsSystem>();
        assets.AddCardAsset(4, "card4.png");
        assets.AddCardAsset(7, "card7.png");

        var cards = Game.GetSystem<CardsSystem>();

        foreach (Seat seat in seats.EnumerateRealSeats().Skip(1))
        {
            hands.AddToHand(cards.Create(0, 0, 4, 22, Flipness.Shown, false), seat);
            hands.AddToHand(cards.Create(0, 0, 7, 22, Flipness.Shown, false), seat);
        }

        // movingCard = cards.Create(-200, -70, 4, 77, Flipness.Shown);

        var texts = Game.GetSystem<TextsSystem>();
        texts.Create("двигаем", -200, -400, 300, 200);

        // contsCard = cards.Create(1, 2, 4, 77, Flipness.Hidden);
        // _clicks.AddClick(contsCard, null, MovingClicked);
    }

    private void MovingClicked(Click obj)
    {
        var cards = Game.GetSystem<CardsSystem>();

        cards.Flip(contsCard);
    }

    protected override void GameSetuped()
    {
        // _times.RequestDelayedExecution(Execution1, TimeSpan.FromSeconds(5));

        // _times.RequestDelayedExecution(MoveExecution, TimeSpan.FromSeconds(1));
    }

    public Card Create(float x, float y, int side)
    {
        var cards = Game.GetSystem<CardsSystem>();

        return cards.Create(x, y, side, 77, Flipness.Shown);
    }

    private void MoveExecution()
    {
        if (movedTimes == 3)
        {
            Game.GetSystem<CardsSystem>().Flip(movingCard);
            movedTimes = 0;
        }

        if (movingCard.X == -200)
        {
            _table.MoveItem(movingCard, 200, -70);
        }
        else
        {
            _table.MoveItem(movingCard, -200, -70);
        }

        movedTimes++;

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