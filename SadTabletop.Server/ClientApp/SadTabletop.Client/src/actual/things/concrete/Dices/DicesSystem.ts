import type TypedEmitter from "@/utilities/TypedEmiiter";
import type LeGame from "@/actual/LeGame";
import type Connection from "@/communication/Connection";
import type DiceInfoMessage from "./Messages/Server/DiceInfoMessage";
import type DiceRolledMessage from "./Messages/Server/DiceRolledMessage";
import type Dice from "./Dice";

type DiceEvents = {
  DiceChanged: (dice: Dice) => void;
  DiceRolled: (dice: Dice) => void;
}

export class DicesSystem {

  readonly game: LeGame;

  readonly events: TypedEmitter<DiceEvents> = new Phaser.Events.EventEmitter();

  constructor(game: LeGame) {
    this.game = game;
  }

  subscribeToConnection(connection: Connection) {
    connection.registerForMessage<DiceInfoMessage>("DiceInfoMessage", msg => this.diceChanged(msg));
    connection.registerForMessage<DiceRolledMessage>("DiceRolledMessage", msg => this.diceRolled(msg));
  }

  private diceChanged(msg: DiceInfoMessage): void {
    const dice = this.game.table.findCast<Dice>(msg.dice);

    if (dice === undefined) {
      console.warn(`diceChanged ентити не был найден. ${msg.dice}`);
      return;
    }

    dice.currentSideIndex = msg.newIndex;

    this.events.emit("DiceChanged", dice);
  }

  private diceRolled(msg: DiceRolledMessage): void {
    const dice = this.game.table.findCast<Dice>(msg.dice);

    if (dice === undefined) {
      console.warn(`diceRolled ентити не был найден. ${msg.dice}`);
      return;
    }

    dice.currentSideIndex = msg.newIndex;

    this.events.emit("DiceRolled", dice);
  }
}
