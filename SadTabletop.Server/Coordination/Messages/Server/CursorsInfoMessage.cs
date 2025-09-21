namespace SadTabletop.Server.Coordination.Messages.Server;

public class CursorsInfoMessage(IList<CursorsInfoMessage.CursorInfo> cursors) : AppServerMessageBase
{
    public class CursorInfo(int playerId, int x, int y)
    {
        public int PlayerId { get; } = playerId;
        public int X { get; } = x;
        public int Y { get; } = y;
    }

    public IList<CursorInfo> Cursors { get; } = cursors;
}