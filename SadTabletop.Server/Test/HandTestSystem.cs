using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SadTabletop.Shared;
using SadTabletop.Shared.Helps;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Hands;
using SadTabletop.Shared.MoreSystems.Shapes;
using SadTabletop.Shared.Systems.Clicks;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Server.Test;

public class HandTestSystem : SystemBase
{
    Card handyCard = null!;

    public HandTestSystem(Game game) : base(game)
    {
    }

    protected override void GameCreated()
    {
        base.GameCreated();

        // this.Game.GetSystem<ShapesSystem>().AddRect(GameValues.HandsArrayStartX, GameValues.HandsArrayStartY,
        //     GameValues.HandsArrayWidth, 200, 0x776600);

        var cards = Game.GetSystem<CardsSystem>();

        handyCard = cards.Create(0, -100, 4, 77, Flipness.Shown);

        Seat seat = Game.GetSystem<SeatsSystem>().GetEntity(1);

        Game.GetSystem<ClicksSystem>().AddClick(handyCard, seat, HandyClicked, false);
    }

    private void HandyClicked(Click click)
    {
        InHandComponent? inHand = handyCard.TryGetComponent<InHandComponent>();

        if (inHand != null)
        {
            Game.GetSystem<HandsSystem>().RemoveFromHand(handyCard);
        }
        else
        {
            Seat seat = Game.GetSystem<SeatsSystem>().GetEntity(1);

            Game.GetSystem<HandsSystem>().AddToHand(handyCard, seat, 0);
        }
    }
}