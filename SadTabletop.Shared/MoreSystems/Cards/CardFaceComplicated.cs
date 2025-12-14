using SadTabletop.Shared.MoreSystems.Cards.Render;

namespace SadTabletop.Shared.MoreSystems.Cards;

/// <summary>
/// Рубашка карты, айди картинки и дои инфа, если нужно.
/// Эххх, сколько приколов меня ждёт, учитывая, что это ссылочный класс, и неосторожное использование придёт к крайне смешным последствиям.
/// </summary>
public class CardFaceComplicated(int side, List<CardRenderInfo>? renderInfos)
{
    public int Side { get; internal set; } = side;

    public List<CardRenderInfo>? RenderInfos { get; internal set; } = renderInfos;

    public static CardFaceComplicated CreateSimple(int side) => new CardFaceComplicated(side, null);

    public static CardFaceComplicatedBuilder CreateBuilder(int side) => new CardFaceComplicatedBuilder(side);

    // public static bool CompareSide(CardFaceComplicated face1, CardFaceComplicated face2)
    // {
    //     
    // }
}

public class CardFaceComplicatedBuilder
{
    public int Side { get; set; }

    public List<CardRenderInfo> RenderInfos { get; } = new();

    public CardFaceComplicatedBuilder(int side)
    {
        Side = side;
    }

    public CardFaceComplicatedBuilder WithText(string text, int x, int y, int width, int height, string? color = null)
    {
        RenderInfos.Add(new CardTextRender(text, x, y, width, height, color));

        return this;
    }

    public CardFaceComplicated Build()
    {
        return new CardFaceComplicated(Side, RenderInfos);
    }
}