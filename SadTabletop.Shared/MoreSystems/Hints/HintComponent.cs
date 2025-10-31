using SadTabletop.Shared.Mechanics;

namespace SadTabletop.Shared.MoreSystems.Hints;

public class HintComponent : ClientComponentBase
{
    public string? Hint { get; internal set; }
}