using SadTabletop.Shared.Systems.Table;

namespace SadTabletop.Shared.MoreSystems.Texts;

public class TextItem(string content, float width, float height) : TableItem
{
    public string Content { get; internal set; } = content;
    public float Width { get; internal set; } = width;
    public float Height { get; internal set; } = height;
}