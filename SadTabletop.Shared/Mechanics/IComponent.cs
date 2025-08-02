namespace SadTabletop.Shared.Mechanics;

/// <summary>
/// Для сериализации.
/// </summary>
public interface IComponent
{
    public Type WhatIsMyType();
}