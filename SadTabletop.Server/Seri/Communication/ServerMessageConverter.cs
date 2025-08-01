using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SadTabletop.Server.Coordination.Messages;
using SadTabletop.Shared.Systems.Communication;

namespace SadTabletop.Server.Seri.Communication;

public class GameServerMessageConverter : JsonConverter<ServerMessageBase>
{
    public override ServerMessageBase? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, ServerMessageBase value, JsonSerializerOptions options)
    {
        JsonNode content = JsonSerializer.SerializeToNode(value, value.GetType(), options);

        MessageWrapper wrapper = new(value.GetType().Name, content);

        string result = JsonSerializer.Serialize(wrapper, options);
        
        writer.WriteRawValue(result, true);
    }
}

public class AppServerMessageConverter : JsonConverter<AppServerMessageBase>
{
    public override AppServerMessageBase? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, AppServerMessageBase value, JsonSerializerOptions options)
    {
        JsonNode content = JsonSerializer.SerializeToNode(value, value.GetType(), options);

        MessageWrapper wrapper = new(value.GetType().Name, content);

        string result = JsonSerializer.Serialize(wrapper, options);
        
        writer.WriteRawValue(result, true);
    }
}