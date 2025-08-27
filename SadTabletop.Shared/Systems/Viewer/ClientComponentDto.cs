using SadTabletop.Shared.Mechanics;

namespace SadTabletop.Shared.Systems.Viewer;

/// <summary>
/// Базовый класс для создания дто версий ентити. Необязательный к использованию, просто сокращение кода.
/// Не предназначен для хранения внутри игры, только для сериализации в локе, в котором был создан.
/// </summary>
public abstract class ClientComponentDto(IClientComponent component) : IClientComponent
{
    public int Id { get; } = component.Id;

    public abstract Type WhatIsMyType();
}