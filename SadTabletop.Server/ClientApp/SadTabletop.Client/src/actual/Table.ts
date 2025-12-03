import type TypedEmitter from "@/utilities/TypedEmiiter";
import { removeFromCollection } from "@/utilities/MyCollections";
import type TableItem from "./things/TableItem";
import type Connection from "@/communication/Connection";
import DeckSystem from "./things/concrete/Decks/DecksSystem";
import CardsSystem from "./things/concrete/Cards/CardsSystem";
import type ItemMovedMessage from "@/communication/messages/server/ItemMovedMessage";
import ClicksSystem from "./things/concrete/Clicks/ClicksSystem";
import type DescriptionChangedMessage from "@/communication/messages/server/DescriptionChangedMessage";

type TableEvents = {
  ItemAddedEarly: (item: TableItem) => void;
  ItemAdded: (item: TableItem, data: object | null) => void;
  ItemRemoved: (item: TableItem) => void;
  ItemMoved: (item: TableItem, oldX: number, oldY: number) => void;
  DescriptionChanged: (item: TableItem, old: string | null) => void;
}

/**
 * Хранит объекты на столе
 */
export default class Table {
  readonly items: TableItem[] = [];

  readonly events: TypedEmitter<TableEvents> = new Phaser.Events.EventEmitter();

  readonly cards: CardsSystem = new CardsSystem(this);
  readonly decks: DeckSystem = new DeckSystem(this);

  readonly clicks: ClicksSystem = new ClicksSystem(this);

  subscribeToConnection(connection: Connection) {
    connection.registerForMessage<ItemMovedMessage>("ItemMovedMessage", msg => this.itemMoved(msg));
    connection.registerForMessage<DescriptionChangedMessage>("DescriptionChangedMessage", msg => this.descriptionChanged(msg));

    this.cards.subscribeToConnection(connection);
    this.decks.subscribeToConnection(connection);
    this.clicks.subscribeToConnection(connection);
  }

  clear() {
    this.items.splice(0);
  }

  isTableEntityByType(type: string) {
    return ["Card", "Dice", "Deck", "TextItem", "RectShape", "CircleShape", "MySprite", "MyTileSprite"].includes(type);
  }

  /**
   * Добавить предмет без ивента
   * @param item
   */
  preAddItem(item: TableItem) {
    this.items.push(item);
  }

  announceItem(item: TableItem, data: object | null) {
    console.log(`в стол добавлена ентити ${item.type} ${item.id}`);
    this.events.emit("ItemAddedEarly", item);
    this.events.emit("ItemAdded", item, data);
  }

  addItem(item: TableItem, data: object | null) {

    console.log(`в стол добавлена ентити ${item.type} ${item.id}`);

    this.items.push(item);

    this.events.emit("ItemAddedEarly", item);
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

  getItem<T extends TableItem>(id: number) {
    const res = this.items.find(i => i.id === id);

    if (res === undefined)
      throw new Error(`Не удалось найти предмет ${id}`);

    return res as T;
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

  private descriptionChanged(msg: DescriptionChangedMessage): void {
    const item = this.items.find(i => i.id === msg.item);

    if (item === undefined) {
      console.warn(`descriptionChanged ентити не был найден. ${msg.item}`);
      return;
    }

    const old = item.description;

    item.description = msg.description;

    this.events.emit("DescriptionChanged", item, old);
  }
}
