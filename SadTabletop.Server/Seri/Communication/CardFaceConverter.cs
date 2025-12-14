using System.Text.Json;
using System.Text.Json.Serialization;
using SadTabletop.Shared.MoreSystems.Cards;

namespace SadTabletop.Server.Seri.Communication;

public class CardFaceConverter : JsonConverter<CardFaceComplicated>
{
    class Replacement(int side, List<CardRenderInfo>? renderInfos) : CardFaceComplicated(side, renderInfos)
    {
    }

    public override CardFaceComplicated? Read(ref Utf8JsonReader reader, Type typeToConvert,
        JsonSerializerOptions options)
    {
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, CardFaceComplicated value, JsonSerializerOptions options)
    {
        if (value.RenderInfos == null || value.RenderInfos.Count == 0)
        {
            JsonSerializer.Serialize(writer, value.Side, options);
            return;
        }

        // TODO сделай нормально как нить
        Replacement r = new(value.Side, value.RenderInfos);

        JsonSerializer.Serialize(writer, r, options);
    }
}