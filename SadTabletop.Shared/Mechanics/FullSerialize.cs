namespace SadTabletop.Shared.Mechanics;

/// <summary>
/// Указанный ентити нужно сериализовывать как объект, а не как ссылку.
/// </summary>
[AttributeUsage(AttributeTargets.Property)]
public class FullSerialize : Attribute
{
    
}