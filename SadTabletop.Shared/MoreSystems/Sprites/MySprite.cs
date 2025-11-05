using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.MoreSystems.Sprites;

public class MySprite : TableItem
{
    public string AssetName { get; internal set; }

    public int? DisplayWidth { get; internal set; }
    public int? DisplayHeight { get; internal set; }

    public MySprite(float x, float y, string assetName) : base(x, y)
    {
        AssetName = assetName;
    }
}