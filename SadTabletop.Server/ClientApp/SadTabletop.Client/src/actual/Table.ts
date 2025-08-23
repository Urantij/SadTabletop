import type TypedEmitter from "@/utilities/TypedEmiiter";
import { removeFromCollection } from "@/utilities/MyCollections";
import type TableItem from "./things/TableItem";
import type Connection from "@/communication/Connection";
import type Card from "./things/concrete/Card";
import { FlipFlipness } from "./things/Flipness";
import type DeckCardInsertedMessage from "./things/concrete/Decks/messages/server/DeckCardInsertedMessage";
import type DeckCardRemovedMessage from "./things/concrete/Decks/messages/server/DeckCardRemovedMessage";
import type DeckUpdatedMessage from "./things/concrete/Decks/messages/server/DeckUpdatedMessage";

type MessageEvents = {
  ItemAdded: (item: TableItem) => void;
  ItemRemoved: (item: TableItem) => void;
  ItemMoved: (item: TableItem, oldX: number, oldY: number) => void;
  CardFlipped: (card: Card) => void;
}

/**
 * Хранит объекты на столе
 */
export default class Table {
  readonly items: TableItem[] = [];

  readonly events: TypedEmitter<MessageEvents> = new Phaser.Events.EventEmitter();

  subscribeToConnection(connection: Connection) {
    connection.events.on("ItemMoved", (data) => this.moveItem(data.item, data.x, data.y));
    connection.events.on("CardFlipped", (data) => this.flipCard(data.card, data.frontSide));

    connection.registerForMessage<DeckUpdatedMessage>("DeckUpdatedMessage", msg => this.deckUpdated(msg));
    connection.registerForMessage<DeckCardInsertedMessage>("DeckCardInsertedMessage", msg => this.deckCardInserted(msg));
    connection.registerForMessage<DeckCardRemovedMessage>("DeckCardRemovedMessage", msg => this.deckCardRemoved(msg))
  }

  isTableEntityByType(type: string) {
    return ["Card", "Dice", "Deck", "TextItem"].includes(type);
  }

  addItem(item: TableItem) {

    console.log(`в стол добавлена ентити ${item.type} ${item.id}`);

    this.items.push(item);

    this.events.emit("ItemAdded", item);
  }

  removeItem(id: number) {
    const entity = removeFromCollection(this.items, i => i.id === id);
    if (entity === undefined) {
      console.log(`table удаляем неизвестный ентити ${id}`);
      return;
    }

    this.events.emit("ItemRemoved", entity);
  }

  moveItem(itemid: number, x: number, y: number) {
    const item = this.items.find(i => i.id === itemid);

    if (item === undefined) {
      console.warn(`При попытке подвинуть ентити не был найден. ${itemid}`);
      return;
    }

    const oldX = item.x;
    const oldY = item.y;

    item.x = x;
    item.y = y;

    this.events.emit("ItemMoved", item, oldX, oldY)
  }

  flipCard(cardId: number, frontSide: number | null): void {
    const card = this.items.find(i => i.id === cardId) as Card;

    if (card === undefined) {
      console.warn(`При попытке flipCard ентити не был найден. ${cardId}`);
      return;
    }

    card.flipness = FlipFlipness(card.flipness);
    card.frontSide = frontSide;

    this.events.emit("CardFlipped", card);
  }

  private deckUpdated(msg: DeckUpdatedMessage): void {
    throw new Error("Method not implemented.");
  }

  private deckCardInserted(msg: DeckCardInsertedMessage): void {
    throw new Error("Method not implemented.");
  }

  private deckCardRemoved(msg: DeckCardRemovedMessage): void {
    throw new Error("Method not implemented.");
  }
}
