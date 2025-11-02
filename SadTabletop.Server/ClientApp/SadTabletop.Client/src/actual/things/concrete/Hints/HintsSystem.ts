import type TypedEmitter from "@/utilities/TypedEmiiter";
import type LeGame from "@/actual/LeGame";
import type Connection from "@/communication/Connection";
import type { NewHintMessage } from "./messages/server/NewHintMessage";
import { findComponent } from "@/utilities/Componenter";
import type HintComponent from "./HintComponent";

type HintEvents = {
  NewHint: (hint: string | null) => void;
}

export default class HintsSystem {

  readonly events: TypedEmitter<HintEvents> = new Phaser.Events.EventEmitter();

  readonly leGame: LeGame;

  currentHint: string | null = null;

  constructor(leGame: LeGame) {
    this.leGame = leGame;
  }

  subscribeToConnection(connection: Connection) {
    this.leGame.events.on("PreDataSet", () => this.preDataSet());

    connection.registerForMessage<NewHintMessage>("NewHintMessage", msg => this.newHinted(msg));
  }

  private preDataSet(): void {
    if (this.leGame.ourPlayer?.seat == null)
      return;

    const component = findComponent<HintComponent>(this.leGame.ourPlayer.seat, "HintComponent");

    if (component?.hint == null)
      return;

    this.currentHint = component.hint;
    this.events.emit("NewHint", this.currentHint);
  }

  private newHinted(msg: NewHintMessage): void {
    this.currentHint = msg.hint;
    this.events.emit("NewHint", this.currentHint);
  }
}
