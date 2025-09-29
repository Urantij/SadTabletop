using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Shared.MoreSystems.Cards;

// TODO можно сделать так чтобы клиент видел только пустой компонент даааа.
public class CardFlipPermissionComponent(Spisok<Seat> theyCan) : ClientComponentBase
{
    public Spisok<Seat> TheyCan { get; } = theyCan;
}