using System.Text;
using SadTabletop.Shared;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Seats;

namespace SadTabletop.Extra.FileDownload;

public class FileDownloadSystem : SystemBase
{
    private readonly CommunicationSystem _communication;

    public FileDownloadSystem(Game game) : base(game)
    {
    }

    public void SendData(Seat seat, string name, string content)
    {
        string res = Convert.ToBase64String(Encoding.UTF8.GetBytes(content), Base64FormattingOptions.None);

        FileDownloadMessage msg = new(name, res);

        _communication.Send(msg, seat);
    }
}