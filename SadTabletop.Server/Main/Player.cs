using SadTabletop.Server.Coordination;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Server.Main;

public class Player(int id, string name, AppClient client, Seat? seat)
{
    public int Id { get; } = id;
    public string Name { get; set; } = name;

    public AppClient Client { get; } = client;

    public Seat? Seat { get; set; } = seat;
}