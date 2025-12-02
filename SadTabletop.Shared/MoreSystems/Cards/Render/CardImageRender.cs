namespace SadTabletop.Shared.MoreSystems.Cards.Render;

/// <summary>
/// Позволяет рисовать изображения поверх рубашки карт
/// </summary>
public class CardImageRender(string imageKey, int x, int y) : CardRenderInfo
{
    public string ImageKey { get; } = imageKey;
    public int X { get; } = x;
    public int Y { get; } = y;
}