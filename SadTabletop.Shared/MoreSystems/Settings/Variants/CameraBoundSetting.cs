namespace SadTabletop.Shared.MoreSystems.Settings.Variants;

public class CameraBoundSetting(float x, float y, float width, float height) : SettingPair
{
    public float X { get; internal set; } = x;
    public float Y { get; internal set; } = y;
    public float Width { get; internal set; } = width;
    public float Height { get; internal set; } = height;
}