import type TypedEmitter from "@/utilities/TypedEmiiter";
import type Table from "@/actual/things/concrete/Table/Table";
import type Card from "./Card";
import { FlipFlipness } from "../../Flipness";
import type Connection from "@/communication/Connection";
import type CardFlippedMessage from "@/actual/things/concrete/Cards/messages/server/CardFlippedMessage";
import type CardInfoMessage from "./messages/server/CardInfoMessage";
import type FlipCardMessage from "./messages/client/FlipCardMessage";
import type TableItem from "../Table/TableItem";
import type CardFaceComplicated from "./CardFaceComplicated";
import { CardFaceUncomplicate, CardFaceUncomplicateForSure } from "./CardCompareHelper";

type CardsEvents = {
  CardFlipped: (card: Card) => void;
  CardFrontChanged: (card: Card) => void;
}

export default class CardsSystem {

  readonly table: Table;

  readonly events: TypedEmitter<CardsEvents> = new Phaser.Events.EventEmitter();

  connection: Connection | undefined;

  constructor(table: Table) {
    this.table = table;
  }

  subscribeToConnection(connection: Connection) {
    this.connection = connection;
    connection.registerForMessage<CardFlippedMessage>("CardFlippedMessage", msg => this.cardFlipped(msg));
    connection.registerForMessage<CardInfoMessage>("CardInfoMessage", msg => this.cardInfoChanged(msg));

    this.table.events.on("EntityAddedEarly", this.earlyItemAdded, this);
  }

  flip(card: Card) {
    const message: FlipCardMessage = {
      card: card.id
    };

    this.connection?.sendMessage("FlipCardMessage", message);
  }

  private flipCard(cardId: number, front: CardFaceComplicated | null): void {
    const card = this.table.entities.find(i => i.id === cardId) as Card;

    if (card === undefined) {
      console.warn(`При попытке flipCard ентити не был найден. ${cardId}`);
      return;
    }

    card.flipness = FlipFlipness(card.flipness);
    card.front = front;

    this.events.emit("CardFlipped", card);
  }

  private cardFlipped(msg: CardFlippedMessage): void {
    msg.front = CardFaceUncomplicate(msg.front);
    this.flipCard(msg.card, msg.front);
  }

  private cardInfoChanged(msg: CardInfoMessage) {
    const card = this.table.entities.find(i => i.id === msg.card) as Card;

    if (card === undefined) {
      console.warn(`При попытке cardInfoChanged ентити не был найден. ${msg.card}`);
      return;
    }

    msg.front = CardFaceUncomplicate(msg.front);

    this.events.emit("CardFrontChanged", card);
  }

  private earlyItemAdded(item: TableItem) {
    if (item.type !== "Card")
      return;

    const card = item as Card;

    card.back = CardFaceUncomplicateForSure(card.back);
    card.front = CardFaceUncomplicate(card.front);
  }
}
