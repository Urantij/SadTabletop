using SadTabletop.Shared;
using SadTabletop.Shared.EvenMoreSystems.Menu;
using SadTabletop.Shared.EvenMoreSystems.Menu.Actions;
using SadTabletop.Shared.EvenMoreSystems.Popit;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Hints;
using SadTabletop.Shared.MoreSystems.Shapes;
using SadTabletop.Shared.Systems.Clicks;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Table;
using SadTabletop.Shared.Systems.Visability;

namespace SadTabletop.Server.Test;

public class FFATestSystem : SystemBase
{
    private readonly ShapesSystem _shapes;
    private readonly SeatsSystem _seats;
    private readonly VisabilitySystem _visability;
    private readonly ClicksSystem _clicks;
    private readonly HintsSystem _hints;
    private readonly TableSystem _table;
    private readonly PopitsSystem _popits;
    private readonly MenuListsSystem _menuLists;
    private readonly MenuSystem _menu;

    private RectShape _mainRect;

    private bool _circleShape = true;
    private bool _greenColor = true;

    public FFATestSystem(Game game) : base(game)
    {
    }

    protected override void GameCreated()
    {
        _mainRect = _shapes.AddRect(-200, 1700, 1000, 600, 0x661111);

        SendServerMenuAction krugSned = _menu.RegisterSend(MenuKrugClicked);
        SendServerMenuAction kvadSned = _menu.RegisterSend(MenuKvadClicked);

        MenuList mainMenu = _menuLists.CreateMenuList([
        ]);

        MenuList _formsLlist = _menuLists.CreateMenuList([
            new MenuButton("круги", krugSned, "green"),
            new MenuButton("квадри", kvadSned),
            new MenuButton("беееек", new ChangeListMenuAction(mainMenu.Id))
        ]);
        MenuList _coolsLlist = _menuLists.CreateMenuList([
            new MenuButton("грин", _menu.RegisterSend((seat) => _greenColor = true), "green"),
            new MenuButton("бву", _menu.RegisterSend((_) => _greenColor = false)),
            new MenuButton("беееек", new ChangeListMenuAction(mainMenu.Id))
        ]);
        mainMenu.Buttons.Add(new MenuButton("форми", new ChangeListMenuAction(_formsLlist.Id)));
        mainMenu.Buttons.Add(new MenuButton("цвети", new ChangeListMenuAction(_coolsLlist.Id)));
        var menu = _menu.CreateMenu("меню 22", mainMenu);

        var seat = (Seat)_seats.EnumerateRawEntities().First();

        _visability.HideFromEveryoneExcept(menu, seat, sendRelatedMessage: false);

        _clicks.AddClick(_mainRect, seat, MainClicked, singleUse: false, sendClickPosition: true);

        _popits.GivePopit("рисуем", ["квадратики", "круглилки"], seat, ShapeSelected);
    }

    private void MenuKrugClicked(Seat seat)
    {
        _circleShape = true;
    }

    private void MenuKvadClicked(Seat seat)
    {
        _circleShape = false;
    }

    private void MainClicked(Click obj)
    {
        SomeShape poor;

        if (_circleShape)
        {
            poor = _shapes.AddCircle((int)(_mainRect.X + obj.X.Value), (int)(_mainRect.Y + obj.Y.Value), 40,
                _greenColor ? 0x228822 : 0x222288, sendRelatedMessage: false);
        }
        else
        {
            poor = _shapes.AddRect((int)(_mainRect.X + obj.X.Value), (int)(_mainRect.Y + obj.Y.Value), 80, 80,
                _greenColor ? 0x228822 : 0x222288, sendRelatedMessage: false);
        }

        _table.ChangeDescription(poor, $"{poor.X:F3}:{poor.Y:F3}", sendRelatedMessage: false);

        var seat = (Seat)_seats.EnumerateRawEntities().First();

        _clicks.AddClick(poor, seat, (_) => { _table.RemoveEntity(poor); }, sendRelatedMessage: false);

        _table.AnnounceEntity(poor);
    }

    private void ShapeSelected(Popit arg1, int? arg2)
    {
        _circleShape = arg2 == 1;

        var seat = (Seat)_seats.EnumerateRawEntities().First();
        _popits.GivePopit("рисуем", ["квадратики", "круглилки"], seat, ShapeSelected);
    }
}