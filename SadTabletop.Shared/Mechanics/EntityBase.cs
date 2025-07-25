namespace SadTabletop.Shared.Mechanics;

/// <summary>
/// Базовый класс для создания сущностей.
/// </summary>
public abstract class EntityBase
{
    /// <summary>
    /// Уникальный айди среди ентити одной ентити системы.
    /// Задаётся сам при добавлении ентити в систему.
    /// </summary>
    public int Id { get; private set; }

    // TODO сериализовать
    /// <summary>
    /// Содержит все компоненты этого ентити.
    /// </summary>
    private List<ComponentBase> _components { get; }

    /// <summary>
    /// Юзается компонент системой, самому не нада трогать
    /// </summary>
    /// <param name="component"></param>
    public void AddComponent(ComponentBase component)
    {
        this._components.Add(component);
    }

    /// <summary>
    /// Юзается компонент системой, самому не нада трогать
    /// </summary>
    /// <param name="component"></param>
    public void RemoveComponent(ComponentBase component)
    {
        this._components.Remove(component);
    }

    public T GetComponent<T>()
    {
        var result = TryGetComponent<T>();
        if (result == null)
            throw new InvalidOperationException();

        return result;
    }

    public T? TryGetComponent<T>()
    {
        return _components.OfType<T>().FirstOrDefault();
    }

    public T? TryGetComponent<T>(Func<T, bool> predicate)
    {
        return _components.OfType<T>().Where(predicate).FirstOrDefault();
    }

    public IEnumerable<ComponentBase> EnumerateComponents()
    {
        return _components;
    }

    /// <summary>
    /// Отдельно из проперти вынес, чтобы случайно нигде не изменить.
    /// Юзается только ентити системой. 
    /// </summary>
    /// <param name="id"></param>
    internal void SetId(int id)
    {
        Id = id;
    }
}