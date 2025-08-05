using System.Text.Json;
using System.Text.Json.Serialization;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Entities;

namespace SadTabletop.Server.Seri.Communication;

// Раньше я юзал имя системы + айди, но в клиенте я и так приводил тип ентити к системе
// Так что логично и тут юзать тип ентити, а не его систему

/// <summary>
/// Конвертирует объект ентити в объект с названием системы и айди ентити. Ссылка так называемая
/// </summary>
public class BaseEntityLinkConverter : JsonConverter<EntityBase>
{
    class Wrap(string type, int id)
    {
        public string Type { get; } = type;
        public int Id { get; } = id;
    }

    private readonly GameResolver _resolver;

    public BaseEntityLinkConverter(GameResolver resolver)
    {
        _resolver = resolver;
    }

    public override EntityBase Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var wrap = JsonSerializer.Deserialize<Wrap>(ref reader, options);

        EntitiesSystem system = _resolver.FindEntitySystemByEntityName(wrap.Type);

        return system.GetRawEntity(wrap.Id);
    }

    public override void Write(Utf8JsonWriter writer, EntityBase value, JsonSerializerOptions options)
    {
        string name = _resolver.GetEntityName(value);

        Wrap wrap = new(name, value.Id);

        JsonSerializer.Serialize(writer, wrap, wrap.GetType(), options);
    }
}

public class EntityLinkConverter : JsonConverter<EntityBase>
{
    private readonly GameResolver _resolver;

    public EntityLinkConverter(GameResolver resolver)
    {
        _resolver = resolver;
    }

    public override EntityBase Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        EntitiesSystem system = _resolver.FindEntitySystemByEntityType(typeToConvert);

        int id = JsonSerializer.Deserialize<int>(ref reader, options);

        return (EntityBase)system.GetRawEntity(id);
    }

    public override void Write(Utf8JsonWriter writer, EntityBase value, JsonSerializerOptions options)
    {
        JsonSerializer.Serialize(writer, value.Id, options);
    }
}

// /// <summary>
// /// Конвертирует ентити в просто айди, так как тип ентити известен, и по нему можно найти систему.
// /// </summary>
// /// <typeparam name="T"></typeparam>
// public class EntityLinkConverter<T> : JsonConverter<T>
//     where T : EntityBase
// {
//     private readonly GameResolver _resolver;
//
//     public EntityLinkConverter(GameResolver resolver)
//     {
//         _resolver = resolver;
//     }
//
//     public override T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
//     {
//         EntitiesSystem system = _resolver.FindEntitySystemByEntityType(typeToConvert);
//
//         int id = JsonSerializer.Deserialize<int>(ref reader, options);
//
//         return (T)system.GetRawEntity(id);
//     }
//
//     public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
//     {
//         JsonSerializer.Serialize(writer, value.Id, options);
//     }
// }