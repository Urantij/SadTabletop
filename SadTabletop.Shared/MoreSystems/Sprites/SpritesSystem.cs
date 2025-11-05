using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Assets;
using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.MoreSystems.Sprites;

/// <summary>
/// Позволяет создавать спрайты. (объекты с текстурой (картинки))
/// </summary>
public class SpritesSystem : SystemBase
{
    private readonly TableSystem _table;

    public SpritesSystem(Game game) : base(game)
    {
    }

    public MySprite CreateSprite(AssetInfo assetInfo, float x, float y)
    {
        MySprite sprite = new(x, y, assetInfo.Name);

        _table.AddEntity(sprite);

        return sprite;
    }

    public MyTileSprite CreateTileSprite(AssetInfo assetInfo, float x, float y, int width, int height)
    {
        MyTileSprite tileSprite = new(x, y, assetInfo.Name, width, height);

        _table.AddEntity(tileSprite);

        return tileSprite;
    }
}