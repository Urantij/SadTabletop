using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Server.More;

public class Colors
{
    public static string GetColor(Seat? seat)
    {
        return seat?.Color switch
        {
            SeatColor.Red => "red",
            SeatColor.Blue => "blue",
            SeatColor.Green => "green",
            SeatColor.Pink => "pink",
            SeatColor.Yellow => "yellow",
            SeatColor.White => "white",
            null => "gray",
            _ => "black"
        };
    }
}