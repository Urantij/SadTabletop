namespace SadTabletop.Server.Coordination.Messages.Server;

/// <summary>
/// Сообщает клиенту его новый ключ для входа.
/// </summary>
/// <param name="key"></param>
public class RegisterFineMessage(string key) : AppServerMessageBase
{
    public string Key { get; } = key;
}