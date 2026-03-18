using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Extra.FileDownload;

public class FileDownloadMessage(string name, string content) : ServerMessageBase
{
    public string Name { get; } = name;

    /// <summary>
    /// base64
    /// </summary>
    public string Content { get; } = content;
}