using SadTabletop.Shared.Mechanics;

namespace SadTabletop.Shared.Systems.Viewer;

/// <summary>
/// Базовый класс для создания дто версий ентити. Необязательный к использованию, просто сокращение кода.
/// Не предназначен для хранения внутри игры, только для сериализации в локе, в котором был создан.
/// </summary>
/// <param name="entity"></param>
public abstract class EntityBaseDto(EntityBase entity) : IEntity
{
    public int Id { get; } = entity.Id;

    private readonly IEnumerable<ClientComponentBase> _clientComponents = entity.ReadClientComponents();

    public IEnumerable<ClientComponentBase> ReadClientComponents()
    {
        return _clientComponents;
    }

    public abstract Type WhatIsMyType();
}