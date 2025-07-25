namespace SadTabletop.Shared.Mechanics;

/// <summary>
/// Система, которая обслуживает работу какого то компонента.
/// Нужна просто чтобы генерировать айди для компонента при их создании.
/// </summary>
public abstract class ComponentSystemBase : SystemBase
{
    protected int NextId { get; set; } = 1;
    
    protected ComponentSystemBase(Game game) : base(game)
    {
    }

    protected void AddComponentToEntity(EntityBase entity, ComponentBase component)
    {
        component.SetId(GenerateId());
        
        entity.AddComponent(component);
    }

    protected void RemoveComponentFromEntity(EntityBase entity, ComponentBase component)
    {
        entity.RemoveComponent(component);
    }
    
    private int GenerateId()
    {
        // сейм что и в ентити системе
        return NextId++;
    }
}