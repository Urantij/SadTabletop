import type TypedEmitter from "@/utilities/TypedEmiiter";
import { removeFromCollection } from "@/utilities/MyCollections";
import type TableItem from "./things/TableItem";

type MessageEvents = {
  ItemAdded: (item: TableItem) => void;
  ItemRemoved: (item: TableItem) => void;
  ItemMoved: (item: TableItem, oldX: number, oldY: number) => void;
}

/**
 * Хранит объекты на столе
 */
export default class Table {
  readonly items: TableItem[] = [];

  readonly events: TypedEmitter<MessageEvents> = new Phaser.Events.EventEmitter();

  isTableEntityByType(type: string) {
    return ["Card", "Dice", "Deck"].includes(type);
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
}
