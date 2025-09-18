namespace SadTabletop.Shared.MoreSystems.Shapes;

public class CircleShape(float x, float y, int radius, int color) : SomeShape(x, y)
{
    public int Radius { get; internal set; } = radius;
    public int Color { get; internal set; } = color;
}