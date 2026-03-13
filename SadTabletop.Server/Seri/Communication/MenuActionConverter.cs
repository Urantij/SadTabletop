using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SadTabletop.Shared.EvenMoreSystems.Menu;

namespace SadTabletop.Server.Seri.Communication;

public class MenuActionConverter : JsonConverter<MenuActionBase>
{
    public override MenuActionBase? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, MenuActionBase value, JsonSerializerOptions options)
    {
        JsonNode node = JsonSerializer.SerializeToNode(value, value.GetType(), options);

        node[options.PropertyNamingPolicy?.ConvertName("Type") ?? "Type"] = value.GetType().Name;

        string raw = JsonSerializer.Serialize(node, options);

        writer.WriteRawValue(raw, true);
    }
}