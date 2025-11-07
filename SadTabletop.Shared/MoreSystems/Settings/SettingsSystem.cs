using SadTabletop.Shared.MoreSystems.Settings.Variants;
using SadTabletop.Shared.Systems.Entities;

namespace SadTabletop.Shared.MoreSystems.Settings;

/// <summary>
/// Изменение синхронизация настроек игры.
/// Имеет особенное поведение - при замене настройки отправляет клиентам настройку как новую, не отправляя сообщение об удалении старой.
/// </summary>
public class SettingsSystem : EntitiesSystem<SettingPair>
{
    public SettingsSystem(Game game) : base(game)
    {
    }

    public CameraBoundSetting SetCameraBounds(float x, float y, float width, float height)
    {
        CameraBoundSetting? cameraBoundSetting = this.List.OfType<CameraBoundSetting>().FirstOrDefault();

        if (cameraBoundSetting != null)
        {
            RemoveEntity(cameraBoundSetting, sendRelatedMessage: false);
        }

        cameraBoundSetting = new CameraBoundSetting(x, y, width, height);
        AddEntity(cameraBoundSetting);

        return cameraBoundSetting;
    }

    public void RemoveCameraBounds()
    {
        CameraBoundSetting? cameraBoundSetting = this.List.OfType<CameraBoundSetting>().FirstOrDefault();

        if (cameraBoundSetting == null)
        {
            // TODO warn
            return;
        }

        RemoveEntity(cameraBoundSetting);
    }
}