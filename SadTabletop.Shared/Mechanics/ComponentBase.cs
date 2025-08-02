using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.Mechanics;

/// <summary>
/// Базовый класс для создания компонентов.
/// </summary>
public abstract class ComponentBase
{
    // до сих пор не уверен нужен ли айди компонентам. ну да фиг с ними.

    public int Id { get; private set; }

    internal void SetId(int id)
    {
        Id = id;
    }
}

/// <summary>
/// <inheritdoc cref="ComponentBase"/>
/// Эти компоненты отправляются клиентам при синхронизации.
/// Чтобы переопределить модель для клиента, используется <see cref="ViewerSystem"/>
/// </summary>
public abstract class ClientComponentBase : ComponentBase, IComponent
{
    public abstract Type WhatIsMyType();
}