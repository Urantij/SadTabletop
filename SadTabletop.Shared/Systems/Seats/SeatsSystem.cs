using SadTabletop.Shared.Systems.Entities;

namespace SadTabletop.Shared.Systems.Seats;

/// <summary>
/// Игровые места, от лица которых действую игроки
/// </summary>
public class SeatsSystem : EntitiesSystem<Seat>
{
    private static readonly SeatColor[] UniqueColors =
    [
        SeatColor.Red,
        SeatColor.Blue,
        SeatColor.Green,
        SeatColor.Pink,
        SeatColor.Yellow
    ];

    public SeatsSystem(Game game) : base(game)
    {
    }

    public Seat AddSeat()
    {
        int index = List.Count;

        SeatColor color;
        if (index < UniqueColors.Length)
        {
            color = UniqueColors[index];
        }
        else
        {
            color = SeatColor.White;
        }

        Seat seat = new(color);
        AddEntity(seat);

        return seat;
    }

    public IEnumerable<Seat?> EnumerateSeats()
    {
        return List.Prepend(null);
    }
}