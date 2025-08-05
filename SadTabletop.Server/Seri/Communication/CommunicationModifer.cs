using System.Text.Json.Serialization.Metadata;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Synchro.Messages;

namespace SadTabletop.Server.Seri.Communication;

public class CommunicationModifer
{
    // Хранит список ентити из ентити систем
    private readonly IReadOnlyList<Type> _toLinkEntities;

    private readonly EntityLinkConverter _entityLinkConverter;
    private readonly BaseEntityLinkConverter _baseEntityLinkConverter;
    private readonly ComponentLinkConverter _componentLinkConverter;

    public CommunicationModifer(GameResolver gameResolver)
    {
        _toLinkEntities = gameResolver.GetEntitiesTypesFromEntitiesSystem();

        _entityLinkConverter = new EntityLinkConverter(gameResolver);
        _baseEntityLinkConverter = new BaseEntityLinkConverter(gameResolver);
        _componentLinkConverter = new ComponentLinkConverter();
    }

    public void Do(JsonTypeInfo info)
    {
        foreach (JsonPropertyInfo propertyInfo in info.Properties)
        {
            if (propertyInfo.PropertyType == typeof(EntityBase))
            {
                propertyInfo.CustomConverter = _baseEntityLinkConverter;
            }
            // else if (_toLinkEntities.Any(e => propertyInfo.PropertyType.IsAssignableTo(e)))
            else if (propertyInfo.PropertyType.IsAssignableTo(typeof(EntityBase)))
            {
                propertyInfo.CustomConverter = _entityLinkConverter;
            }
            else if (propertyInfo.PropertyType.IsAssignableTo(typeof(ClientComponentBase)))
            {
                propertyInfo.CustomConverter = _componentLinkConverter;
            }
        }
    }
}