namespace SadTabletop.Shared.MoreSystems.Shapes;

public class RectShape(float x, float y, int width, int height, int color) : SomeShape(x, y)
{
    public int Width { get; internal set; } = width;
    public int Height { get; internal set; } = height;

    public int Color { get; internal set; } = color;
}