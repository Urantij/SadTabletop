using SadTabletop.Shared;
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

    private RectShape _mainRect;

    public FFATestSystem(Game game) : base(game)
    {
    }

    protected override void GameCreated()
    {
        _mainRect = _shapes.AddRect(-200, 1700, 1000, 600, 0x661111);

        var seat = (Seat)_seats.EnumerateRawEntities().First();

        _clicks.AddClick(_mainRect, seat, MainClicked, singleUse: false, sendClickPosition: true);
    }

    private void MainClicked(Click obj)
    {
        CircleShape poor = _shapes.AddCircle((int)(_mainRect.X + obj.X.Value), (int)(_mainRect.Y + obj.Y.Value), 40,
            0x228822);

        var seat = (Seat)_seats.EnumerateRawEntities().First();

        _clicks.AddClick(poor, seat, (_) => { _table.RemoveEntity(poor); });
    }
}