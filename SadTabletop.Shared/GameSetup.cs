namespace SadTabletop.Shared;

/// <summary>
/// Хранит информацию, поданную при создании игры 
/// </summary>
public class GameSetup(int requestedNumberOfSeats, Dictionary<string, string> values)
{
    /// <summary>
    /// Сколько у игры попросили мест.
    /// </summary>
    public int RequestedNumberOfSeats { get; } = requestedNumberOfSeats;

    /// <summary>
    /// Дополнительные выбранные опции.
    /// </summary>
    public Dictionary<string, string> Values { get; } = values;
}