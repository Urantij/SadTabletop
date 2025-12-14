namespace SadTabletop.Shared.MoreSystems.Cards;

/// <summary>
/// Информация для модификации текстуры карты
/// </summary>
public abstract class CardRenderInfo
{
    // А он вообще нужен? Можно же просто по индексу отсылаться, когда нужно изменить
    public int Id { get; }
    public int Layer { get; }
}