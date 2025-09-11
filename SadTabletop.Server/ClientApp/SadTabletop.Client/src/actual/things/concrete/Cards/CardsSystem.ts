import type TypedEmitter from "@/utilities/TypedEmiiter";
import type Table from "@/actual/Table";
import type Card from "./Card";
import { FlipFlipness } from "../../Flipness";
import type Connection from "@/communication/Connection";
import type CardFlippedMessage from "@/actual/things/concrete/Cards/messages/server/CardFlippedMessage";
import type CardInfoMessage from "./messages/server/CardInfoMessage";

type MessageEvents = {
  CardFlipped: (card: Card) => void;
  CardFrontChanged: (card: Card) => void;
}

export default class CardsSystem {

  readonly table: Table;

  readonly events: TypedEmitter<MessageEvents> = new Phaser.Events.EventEmitter();

  constructor(table: Table) {
    this.table = table;
  }

  subscribeToConnection(connection: Connection) {
    connection.registerForMessage<CardFlippedMessage>("CardFlippedMessage", msg => this.cardFlipped(msg));
    connection.registerForMessage<CardInfoMessage>("CardInfoMessage", msg => this.cardInfoChanged(msg));
  }

  flipCard(cardId: number, frontSide: number | null): void {
    const card = this.table.items.find(i => i.id === cardId) as Card;

    if (card === undefined) {
      console.warn(`При попытке flipCard ентити не был найден. ${cardId}`);
      return;
    }

    card.flipness = FlipFlipness(card.flipness);
    card.frontSide = frontSide;

    this.events.emit("CardFlipped", card);
  }

  private cardFlipped(msg: CardFlippedMessage): void {
    this.flipCard(msg.card, msg.frontSide);
  }

  private cardInfoChanged(msg: CardInfoMessage) {
    const card = this.table.items.find(i => i.id === msg.card) as Card;

    if (card === undefined) {
      console.warn(`При попытке cardInfoChanged ентити не был найден. ${msg.card}`);
      return;
    }

    card.frontSide = msg.front;

    this.events.emit("CardFrontChanged", card);
  }
}
