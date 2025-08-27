namespace SadTabletop.Shared.Mechanics;

/// <summary>
/// Для сериализации.
/// </summary>
public interface IClientComponent
{
    public int Id { get; }

    public Type WhatIsMyType();
}