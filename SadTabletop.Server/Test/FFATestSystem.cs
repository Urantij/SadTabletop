using SadTabletop.Shared;
using SadTabletop.Shared.EvenMoreSystems.Popit;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Shapes;
using SadTabletop.Shared.Systems.Clicks;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Server.Test;

public class FFATestSystem : SystemBase
{
    private readonly ShapesSystem _shapes;
    private readonly SeatsSystem _seats;
    private readonly ClicksSystem _clicks;
    private readonly TableSystem _table;
    private readonly PopitsSystem _popits;

    private RectShape _mainRect;

    private bool _circleShape = true;

    public FFATestSystem(Game game) : base(game)
    {
    }

    protected override void GameCreated()
    {
        _mainRect = _shapes.AddRect(-200, 1700, 1000, 600, 0x661111);

        var seat = (Seat)_seats.EnumerateRawEntities().First();

        _clicks.AddClick(_mainRect, seat, MainClicked, singleUse: false, sendClickPosition: true);

        _popits.GivePopit("рисуем", ["квадратики", "круглилки"], seat, ShapeSelected);
    }

    private void MainClicked(Click obj)
    {
        SomeShape poor;

        if (_circleShape)
        {
            poor = _shapes.AddCircle((int)(_mainRect.X + obj.X.Value), (int)(_mainRect.Y + obj.Y.Value), 40,
                0x228822);
        }
        else
        {
            poor = _shapes.AddRect((int)(_mainRect.X + obj.X.Value), (int)(_mainRect.Y + obj.Y.Value), 80, 80,
                0x228822);
        }

        var seat = (Seat)_seats.EnumerateRawEntities().First();

        _clicks.AddClick(poor, seat, (_) => { _table.RemoveEntity(poor); });
    }

    private void ShapeSelected(Popit arg1, int? arg2)
    {
        _circleShape = arg2 == 1;

        var seat = (Seat)_seats.EnumerateRawEntities().First();
        _popits.GivePopit("рисуем", ["квадратики", "круглилки"], seat, ShapeSelected);
    }
}