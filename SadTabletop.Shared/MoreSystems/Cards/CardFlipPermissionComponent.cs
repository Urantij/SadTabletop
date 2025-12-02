using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Shared.MoreSystems.Cards;

// TODO можно сделать так чтобы клиент видел только пустой компонент даааа.
/// <summary>
/// Игроки в списке могут свободно переворачивать карту.
/// </summary>
/// <param name="theyCan"></param>
public class CardFlipPermissionComponent(Spisok<Seat> theyCan) : ClientComponentBase
{
    public Spisok<Seat> TheyCan { get; } = theyCan;
}