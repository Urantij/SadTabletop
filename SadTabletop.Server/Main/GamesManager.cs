namespace SadTabletop.Server.Main;

/// <summary>
/// Хранит игрушки
/// </summary>
public class GamesManager
{
    public GameContainer? GameContainer { get; set; }

    public GamesManager()
    {
    }
    
    public GameContainer GetCurrentContainer()
    {
        if (GameContainer == null)
            throw new Exception();
        
        return GameContainer;
    }
}