using SadTabletop.Shared.Mechanics;

namespace SadTabletop.Shared.Systems.Seats;

/// <summary>
/// Место за игровым столом. Игроки садятся на место, и от этого места совершают действия.
/// Игроки без места приравниваются к месту со значением null
/// </summary>
public class Seat(SeatColor color) : EntityBase
{
    public SeatColor Color { get; } = color;
}