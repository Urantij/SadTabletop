namespace SadTabletop.Shared.MoreSystems.Cards.Render;

/// <summary>
/// Рисует текст поверх карты
/// </summary>
public class CardTextRender(string text, int x, int y, int width, int height, string? color = null)
    : CardRenderInfo
{
    public string Text { get; internal set; } = text;
    public string? Color { get; internal set; } = color;
    public int X { get; internal set; } = x;
    public int Y { get; internal set; } = y;
    public int Width { get; internal set; } = width;
    public int Height { get; internal set; } = height;
}