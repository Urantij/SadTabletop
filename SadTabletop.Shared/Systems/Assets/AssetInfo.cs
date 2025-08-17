using SadTabletop.Shared.Mechanics;

namespace SadTabletop.Shared.Systems.Assets;

public class AssetInfo(string name, string url) : EntityBase
{
    public string Name { get; } = name;
    public string Url { get; } = url;
}