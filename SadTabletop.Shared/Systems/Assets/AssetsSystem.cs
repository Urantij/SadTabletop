using SadTabletop.Shared.Systems.Entities;

namespace SadTabletop.Shared.Systems.Assets;

public class AssetsSystem : EntitiesSystem<AssetInfo>
{
    public AssetsSystem(Game game) : base(game)
    {
    }

    public AssetInfo AddCardAsset(int num, string url)
    {
        AssetInfo assetInfo = new AssetInfo($"card{num}", url);

        this.AddEntity(assetInfo);

        return assetInfo;
    }

    public AssetInfo AddAsset(string name, string url)
    {
        AssetInfo assetInfo = new AssetInfo(name, url);

        this.AddEntity(assetInfo);

        return assetInfo;
    }
}