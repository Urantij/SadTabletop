using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Server.Seri.Communication;

// хочется назвать его IEntityConverter, но это ведь не интерфейс, хихи
/// <summary>
/// Делает полную сериализацию ентити
/// </summary>
public class EntityConverter : JsonConverter<IEntity>
{
    private readonly GameResolver _resolver;
    private readonly ViewerSystem _viewer;

    public EntityConverter(GameResolver resolver, ViewerSystem viewer)
    {
        _viewer = viewer;
        _resolver = resolver;
    }

    public override IEntity Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, IEntity value, JsonSerializerOptions options)
    {
        IEntity toSerialize = _viewer.View(value);

        JsonNode node = JsonSerializer.SerializeToNode(toSerialize, toSerialize.GetType(), options);

        node["Type"] = JsonValue.Create(_resolver.GetEntityName(value));
        node["Components"] = new JsonArray(
            value.ReadClientComponents().Select(c =>
            {
                object a = _viewer.View(c);

                return JsonSerializer.SerializeToNode(a, a.GetType(), options);
            }).ToArray()
        );

        string raw = JsonSerializer.Serialize(node, options);

        writer.WriteRawValue(raw, true);
    }
}