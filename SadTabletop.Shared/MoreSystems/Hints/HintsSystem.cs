using SadTabletop.Shared.Mechanics;
using SadTabletop.Shared.MoreSystems.Hints.Messages.Server;
using SadTabletop.Shared.Systems.Communication;
using SadTabletop.Shared.Systems.Seats;
using SadTabletop.Shared.Systems.Viewer;

namespace SadTabletop.Shared.MoreSystems.Hints;

/// <summary>
/// Небольшие подсказки, которые пишет сверху экрана. 
/// </summary>
public class HintsSystem : ComponentSystemBase
{
    private readonly CommunicationSystem _communication;

    public HintsSystem(Game game) : base(game)
    {
    }

    protected internal override void GameLoaded()
    {
        base.GameLoaded();

        Game.GetSystem<ViewerSystem>().RegisterComponent<HintComponent>(TransformHint);
    }

    /// <summary>
    /// Вывести игроку на лицо этот текст
    /// </summary>
    /// <param name="seat"></param>
    /// <param name="hint"></param>
    public void GiveHint(Seat seat, string? hint)
    {
        HintComponent? component = seat.TryGetComponent<HintComponent>();

        if (component == null)
        {
            component = new HintComponent();
            AddComponentToEntity(seat, component);
        }

        component.Hint = hint;

        NewHintMessage message = new(hint);

        _communication.Send(message, seat);
    }

    /// <summary>
    /// Убрать с лица игрока текст
    /// </summary>
    /// <param name="seat"></param>
    public void RemoveHint(Seat seat)
    {
        HintComponent? component = seat.TryGetComponent<HintComponent>();

        if (component == null)
        {
            // TODO варн
            return;
        }

        component.Hint = null;

        NewHintMessage message = new(null);

        _communication.Send(message, seat);
    }

    private IClientComponent? TransformHint(HintComponent thing, Seat? target)
    {
        // TODO возможно стоит в трансформ подавать сам ентити

        HintComponent? component = target?.TryGetComponent<HintComponent>();

        if (component != thing)
            return null;

        return thing;
    }
}