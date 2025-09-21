namespace SadTabletop.Server.Coordination.Messages.Client;

public class MoveCursorMessage(int x, int y) : AppClientMessageBase
{
    public int X { get; } = x;
    public int Y { get; } = y;
}