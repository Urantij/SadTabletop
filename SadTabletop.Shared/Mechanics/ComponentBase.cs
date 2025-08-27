using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.Mechanics;

/// <summary>
/// Базовый класс для создания компонентов.
/// </summary>
public abstract class ComponentBase
{
}

/// <summary>
/// <inheritdoc cref="ComponentBase"/>
/// Эти компоненты отправляются клиентам при синхронизации.
/// Чтобы переопределить модель для клиента, используется <see cref="ViewerSystem"/>
/// </summary>
public abstract class ClientComponentBase : ComponentBase, IClientComponent
{
    public int Id { get; private set; }

    internal void SetId(int id)
    {
        Id = id;
    }

    public Type WhatIsMyType()
    {
        return this.GetType();
    }
}