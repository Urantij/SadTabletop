using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Shared.MoreSystems.Hints.Messages.Server;

public class NewHintMessage(string? hint) : ServerMessageBase
{
    public string? Hint { get; } = hint;
}