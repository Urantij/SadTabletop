using SadTabletop.Shared;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Entities;

namespace SadTabletop.Server.Seri;

/// <summary>
/// Позволяет сериализатору находить ентити и системы
/// </summary>
public class GameResolver
{
    private readonly Game _game;
    private readonly EntitiesSystem[] _entitiesSystems;
    private readonly Dictionary<Type, EntitiesSystem> _entityTypeToSystem;

    public GameResolver(Game game)
    {
        _game = game;

        _entitiesSystems = _game.Systems.OfType<EntitiesSystem>().ToArray();

        // _entityTypeToSystem =
        //     _entitiesSystems.ToDictionary(key => SeriHelper.GetEntityType(key.GetType()), value => value);
        _entityTypeToSystem = new Dictionary<Type, EntitiesSystem>();

        // oof
        foreach (EntitiesSystem system in _entitiesSystems)
        {
            Type entityType = SeriHelper.GetEntityType(system.GetType());
            Type[] all = SeriHelper.FindRealEntities(entityType);

            _entityTypeToSystem[entityType] = system;
            foreach (Type one in all)
            {
                _entityTypeToSystem[one] = system;
            }
        }
    }

    public Type[] GetEntitiesTypesFromEntitiesSystem()
    {
        return _entityTypeToSystem.Keys.ToArray();
    }

    public EntitiesSystem FindEntitiesSystemByName(string name)
    {
        return _entitiesSystems.First(s => GetSystemName(s) == name);
    }

    public EntitiesSystem FindEntitySystemByEntityType(Type entityType)
    {
        return _entityTypeToSystem[entityType];
    }

    public EntitiesSystem FindEntitySystemByEntityName(string typeName)
    {
        // TODO нормально придумать термины и переделать этот ужас
        return _entityTypeToSystem.First(k => GetEntityName(k.Key) == typeName).Value;
    }

    public string FindEntitiesSystemNameByEntity(EntityBase entity)
    {
        return FindEntitySystemByEntityType(entity.GetType()).GetType().Name;
    }

    public string GetEntityName(IEntity entity)
    {
        return GetEntityName(entity.WhatIsMyType());
    }

    public string GetEntityName(Type type)
    {
        return type.Name;
    }

    public string GetComponentName(IClientComponent entity)
    {
        return entity.WhatIsMyType().Name;
    }

    public string GetSystemName(SystemBase system)
    {
        return system.GetType().Name;
    }
}