namespace SadTabletop.Shared.Systems.Events;

/// <summary>
/// Меньше = раньше
/// </summary>
public enum EventPriority
{
    Init = 0,
    Soon = 10,
    Normal = 100,
    Late = 1000,
    Latest = 10000
}