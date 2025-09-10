using SadTabletop.Shared.Systems.Entities;

namespace SadTabletop.Shared.MoreSystems.Shapes;

public class ShapesSystem : EntitiesSystem<SomeShape>
{
    public ShapesSystem(Game game) : base(game)
    {
    }

    public RectShape AddRect(int x, int y, int width, int height, int color)
    {
        RectShape rect = new(x, y, width, height, color);
        
        AddEntity(rect);

        return rect;
    }
}