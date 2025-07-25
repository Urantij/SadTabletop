using SadTabletop.Shared.Systems.Entities;

namespace SadTabletop.Shared.Systems.Seats;

/// <summary>
/// Игровые места, от лица которых действую игроки
/// </summary>
public class SeatsSystem : EntitiesSystem<Seat>
{
    public SeatsSystem(Game game) : base(game)
    {
    }

    public IEnumerable<Seat?> EnumerateSeats()
    {
        return List.Prepend(null);
    }
}