using SadTabletop.Shared.MoreSystems.Hands;
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

    private readonly HandsSystem _hands;

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

    public Seat[] CreateRoundSeats(int count, int x, int y, float radius)
    {
        Seat[] seats = new Seat[count];

        // float angleChange = 360f / count;
        double angleChange = (2 * Math.PI) / count;

        // double currentAngle = (3 * Math.PI) / 2;
        double currentAngle = 0.5 * Math.PI;

        for (int i = 0; i < count; i++)
        {
            Seat seat = AddSeat();

            double sin = Math.Sin(currentAngle);
            double cos = Math.Cos(currentAngle);

            int seatX = (int)Math.Round(x + cos * radius);
            int seatY = (int)Math.Round(y + sin * radius);

            // количество п подобрал наугад
            double rotation = currentAngle + 3 * Math.PI / 2;

            _hands.ModifyHand(seat, seatX, seatY, (float)rotation);

            currentAngle += angleChange;
        }

        return seats;
    }

    public IEnumerable<Seat> EnumerateRealSeats()
    {
        return List;
    }

    public IEnumerable<Seat?> EnumerateAllSeats()
    {
        return List.Prepend(null);
    }
}