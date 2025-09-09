using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Shared.MoreSystems.Hands;

/// <summary>
/// <see cref="Seat"/> меняет характеристики руки.
/// </summary>
public class HandOverrideComponent(int? x = null, int? y = null, float? rotation = null) : ClientComponentBase
{
    public int? X { get; } = x;
    public int? Y { get; } = y;
    public float? Rotation { get; } = rotation;
}