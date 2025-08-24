using SadTabletop.Shared;
using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Cards;
using SadTabletop.Shared.MoreSystems.Decks;
using SadTabletop.Shared.Systems.Times;

namespace SadTabletop.Server.Test;

public class AnotherTestSystem : SystemBase
{
    private readonly TimesSystem _times;
    private readonly DecksSystem _decks;
    
    private Deck deck;
    
    public AnotherTestSystem(Game game) : base(game)
    {
    }

    protected override void GameCreated()
    {
        base.GameCreated();
        
        deck = _decks.Create(-200, 400, Flipness.Shown, [
            new DeckCardInfo(77, 4),
            new DeckCardInfo(77, 7),
            new DeckCardInfo(77, 7),
        ]);

        _times.RequestDelayedExecution(FirstEx, TimeSpan.FromSeconds(5));
    }

    private void FirstEx()
    {
        Card card = _decks.GetCard(deck, 200, 400, Flipness.Shown);
        
        _times.RequestDelayedExecution(() =>
        {
            _decks.PutCard(deck, card, DeckWay.Front);
            
            _times.RequestDelayedExecution(FirstEx, TimeSpan.FromSeconds(5));
        }, TimeSpan.FromSeconds(5));
    }
}