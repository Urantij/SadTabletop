using System.Text.Json;
using System.Text.Json.Serialization;
using SadTabletop.Shared.Mechanics;

namespace SadTabletop.Server.Seri.Communication;

/// <summary>
/// Сериализует компонент в его айди. Этого недостаточно, чтобы найти его, но это неважно.
/// </summary>
public class ComponentLinkConverter : JsonConverter<ComponentBase>
{
    public override ComponentBase? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, ComponentBase value, JsonSerializerOptions options)
    {
        JsonSerializer.Serialize(writer, value.Id, options);
    }
}