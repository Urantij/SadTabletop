using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SadTabletop.Shared.Systems.Synchro;

namespace SadTabletop.Server.Seri.Communication;

/// <summary>
/// Делает полную сериализацию ентити
/// </summary>
public class EntityConverter : JsonConverter<ViewedEntity>
{
    private readonly GameResolver _resolver;

    public EntityConverter(GameResolver resolver)
    {
        _resolver = resolver;
    }

    public override ViewedEntity Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, ViewedEntity value, JsonSerializerOptions options)
    {
        JsonNode node = JsonSerializer.SerializeToNode(value.Entity, value.Entity.GetType(), options);

        node[options.PropertyNamingPolicy?.ConvertName("Type") ?? "Type"] =
            JsonValue.Create(_resolver.GetEntityName(value.Entity));
        node[options.PropertyNamingPolicy?.ConvertName("Components") ?? "Components"] = new JsonArray(
            value.Components.Select(c =>
            {
                JsonNode componentNode = JsonSerializer.SerializeToNode(c, c.GetType(), options);
                componentNode[options.PropertyNamingPolicy?.ConvertName("Type") ?? "Type"] =
                    JsonValue.Create(_resolver.GetComponentName(c));

                return componentNode;
            }).ToArray()
        );

        string raw = JsonSerializer.Serialize(node, options);

        writer.WriteRawValue(raw, true);
        // IEntity toSerialize = _viewer.View(value);
        //
        // JsonNode node = JsonSerializer.SerializeToNode(toSerialize, toSerialize.GetType(), options);
        //
        // node["Type"] = JsonValue.Create(_resolver.GetEntityName(value));
        // node["Components"] = new JsonArray(
        //     value.ReadClientComponents().Select(c =>
        //     {
        //         object a = _viewer.View(c);
        //
        //         return JsonSerializer.SerializeToNode(a, a.GetType(), options);
        //     }).ToArray()
        // );
        //
        // string raw = JsonSerializer.Serialize(node, options);
        //
        // writer.WriteRawValue(raw, true);
    }
}