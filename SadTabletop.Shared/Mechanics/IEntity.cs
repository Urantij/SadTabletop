namespace SadTabletop.Shared.Mechanics;

/// <summary>
/// Просто отметка, чтобы сериализовывать сущности и их дто было легче.
/// Проперти с типом <see cref="IEntity"/> СЕРИАЛИЗУЮТСЯ ЦЕЛИКОМ. <see cref="EntityBase"/> сериализуются как ссылки.
/// </summary>
public interface IEntity
{
    // просто так.
    public int Id { get; }

    public IEnumerable<ClientComponentBase> ReadClientComponents();

    public Type WhatIsMyType();
}