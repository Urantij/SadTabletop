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

    // public static bool CompareSide(CardFaceComplicated face1, CardFaceComplicated face2)
    // {
    //     
    // }
}