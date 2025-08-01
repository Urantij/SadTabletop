using System.Text.Json;
using System.Text.Json.Serialization;
using SadTabletop.Shared.Mechanics;

namespace SadTabletop.Server.Seri.Communication;

// это уже дурость, ну ладно
public class SystemConverter : JsonConverter<SystemBase>
{
    private readonly GameResolver _resolver;

    public SystemConverter(GameResolver resolver)
    {
        _resolver = resolver;
    }

    public override SystemBase? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, SystemBase value, JsonSerializerOptions options)
    {
        string writeValue = JsonSerializer.Serialize(_resolver.GetSystemName(value));

        writer.WriteRawValue(writeValue, true);
    }
}