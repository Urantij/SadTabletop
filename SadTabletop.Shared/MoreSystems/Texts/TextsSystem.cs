using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.MoreSystems.Texts;

public class TextsSystem : SystemBase
{
    private readonly TableSystem _table;

    public TextsSystem(Game game) : base(game)
    {
    }

    public void Create(string content, float x, float y, float width, float height)
    {
        TextItem text = new(content, width, height)
        {
            X = x,
            Y = y
        };

        _table.AddEntity(text);
    }
}