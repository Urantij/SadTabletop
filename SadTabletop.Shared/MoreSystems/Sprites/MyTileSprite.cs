using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.MoreSystems.Sprites;

public class MyTileSprite : TableItem
{
    public string AssetName { get; internal set; }

    public int Width { get; internal set; }
    public int Height { get; internal set; }

    public int? TileX { get; internal set; }
    public int? TileY { get; internal set; }

    public float? TileScaleX { get; internal set; }
    public float? TileScaleY { get; internal set; }

    public MyTileSprite(float x, float y, string assetName, int width, int height) : base(x, y)
    {
        AssetName = assetName;
        Width = width;
        Height = height;
    }
}