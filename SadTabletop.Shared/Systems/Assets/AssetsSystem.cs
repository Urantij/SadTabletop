using SadTabletop.Shared.Systems.Entities;

namespace SadTabletop.Shared.Systems.Assets;

public class AssetsSystem : EntitiesSystem<AssetInfo>
{
    public AssetsSystem(Game game) : base(game)
    {
    }

    public void AddCardAsset(int num, string url)
    {
        this.AddEntity(new AssetInfo($"card{num}", url));
    }

    public void AddAsset(string name, string url)
    {
        this.AddEntity(new AssetInfo(name, url));
    }
}