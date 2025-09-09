import type TypedEmitter from "@/utilities/TypedEmiiter";
import { removeFromCollection } from "@/utilities/MyCollections";
import type TableItem from "./things/TableItem";
import type Connection from "@/communication/Connection";
import DeckSystem from "./things/concrete/Decks/DecksSystem";
import CardsSystem from "./things/concrete/Cards/CardsSystem";
import type ItemMovedMessage from "@/communication/messages/server/ItemMovedMessage";
import ClicksSystem from "./things/concrete/Clicks/ClicksSystem";

type MessageEvents = {
  ItemAdded: (item: TableItem, data: object | null) => void;
  ItemRemoved: (item: TableItem) => void;
  ItemMoved: (item: TableItem, oldX: number, oldY: number) => void;
  Clearing: () => void;
}

/**
 * Хранит объекты на столе
 */
export default class Table {
  readonly items: TableItem[] = [];

  readonly events: TypedEmitter<MessageEvents> = new Phaser.Events.EventEmitter();

  readonly cards: CardsSystem = new CardsSystem(this);
  readonly decks: DeckSystem = new DeckSystem(this);

  readonly clicks: ClicksSystem = new ClicksSystem(this);

  subscribeToConnection(connection: Connection) {
    connection.registerForMessage<ItemMovedMessage>("ItemMovedMessage", msg => this.itemMoved(msg));

    this.cards.subscribeToConnection(connection);
    this.decks.subscribeToConnection(connection);
    this.clicks.subscribeToConnection(connection);
  }

  clear() {
    this.items.splice(0);
    this.events.emit("Clearing");
  }

  isTableEntityByType(type: string) {
    return ["Card", "Dice", "Deck", "TextItem"].includes(type);
  }

  addItem(item: TableItem, data: object | null) {

    console.log(`в стол добавлена ентити ${item.type} ${item.id}`);

    this.items.push(item);

    this.events.emit("ItemAdded", item, data);
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

  findItem<T extends TableItem>(id: number) {
    const res = this.items.find(i => i.id === id);

    if (res === undefined)
      return res;

    return res as T;
  }

  private itemMoved(msg: ItemMovedMessage): void {
    this.moveItem(msg.item, msg.x, msg.y);
  }
}
