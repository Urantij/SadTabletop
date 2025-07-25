namespace SadTabletop.Shared.Mechanics;

/// <summary>
/// Базовый класс для создания систем.
/// </summary>
public abstract class SystemBase
{
    protected readonly Game Game;

    protected SystemBase(Game game)
    {
        Game = game;
    }
    
    /// <summary>
    /// Срабатывает, когда игра создана впервые.
    /// </summary>
    protected internal virtual void GameCreated()
    {
        
    }

    /// <summary>
    /// Срабатывает каждый раз, когда игра загружается.
    /// </summary>
    protected internal virtual void GameLoaded()
    {
        
    }
}