using SadTabletop.Shared;
using SadTabletop.Shared.Systems.Entities;

namespace SadTabletop.Server.Seri;

public static class SeriHelper
{
    public static Type[] FindRealEntities(Type entityType)
    {
        return AppDomain.CurrentDomain.GetAssemblies()
            .SelectMany(ass => ass.GetTypes())
            .Where(type => !type.IsAbstract)
            .Where(type => type.IsAssignableTo(entityType))
            .ToArray();
    }

    /// <summary>
    /// Возвращает ентити, которые живут в клиентовых ентити системах
    /// </summary>
    /// <param name="game"></param>
    /// <returns></returns>
    public static Type[] FindRelevantEntityTypes(Game game)
    {
        return game.Systems.OfType<EntitiesSystem>()
            .Where(es => es.ClientSided)
            .Select(es => GetEntityType(es.GetType()))
            .Distinct() // наверное не нужно, но мне всё равно
            .ToArray();
    }

    /// <summary>
    /// Принимает тип-наследник от <see cref="EntitiesSystem"/> и выдаёт женерик тип ентити.
    /// </summary>
    /// <param name="systemType"></param>
    /// <returns></returns>
    public static Type GetEntityType(Type systemType)
    {
        // пройтись по дереву типов до женерик ентитиес

        Type? target = systemType;

        while (target != null)
        {
            if (!target.IsConstructedGenericType)
            {
                target = target.BaseType;
                continue;
            }

            if (target.GetGenericTypeDefinition() == typeof(EntitiesSystem<>))
            {
                return target.GetGenericArguments()[0];
            }
        }

        throw new Exception($"система не ентити {systemType.FullName}");
    }
}