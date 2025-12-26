import type TypedEmitter from "@/utilities/TypedEmiiter";
import { removeFromCollection } from "@/utilities/MyCollections";
import type Connection from "@/communication/Connection";
import DeckSystem from "../Decks/DecksSystem";
import CardsSystem from "../Cards/CardsSystem";
import type ItemMovedMessage from "@/communication/messages/server/ItemMovedMessage";
import ClicksSystem from "../Clicks/ClicksSystem";
import type DescriptionChangedMessage from "@/communication/messages/server/DescriptionChangedMessage";
import EntitiesSystem, { type EntitiesEvents } from "../../EntitiesSystem";
import type TableItem from "./TableItem";

type TableEvents = EntitiesEvents<TableItem> & {
  ItemMoved: (item: TableItem, oldX: number, oldY: number) => void;
  DescriptionChanged: (item: TableItem, old: string | null) => void;
}

/**
 * Хранит объекты на столе
 */
export default class Table extends EntitiesSystem<TableItem> {

  readonly events: TypedEmitter<TableEvents> = new Phaser.Events.EventEmitter();

  readonly cards: CardsSystem = new CardsSystem(this);
  readonly decks: DeckSystem = new DeckSystem(this);

  readonly clicks: ClicksSystem = new ClicksSystem(this);

  static DeckTypeName = "Deck";

  subscribeToConnection(connection: Connection) {
    connection.registerForMessage<ItemMovedMessage>("ItemMovedMessage", msg => this.itemMoved(msg));
    connection.registerForMessage<DescriptionChangedMessage>("DescriptionChangedMessage", msg => this.descriptionChanged(msg));

    this.cards.subscribeToConnection(connection);
    this.decks.subscribeToConnection(connection);
    this.clicks.subscribeToConnection(connection);
  }

  override isIncludedEntityByType(type: string) {
    return ["Card", "Dice", Table.DeckTypeName, "TextItem", "RectShape", "CircleShape", "MySprite", "MyTileSprite"].includes(type);
  }

  moveItem(itemid: number, x: number, y: number) {
    const item = this.entities.find(i => i.id === itemid);

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

  private itemMoved(msg: ItemMovedMessage): void {
    this.moveItem(msg.item, msg.x, msg.y);
  }

  private descriptionChanged(msg: DescriptionChangedMessage): void {
    const item = this.find(msg.item);

    if (item === undefined) {
      console.warn(`descriptionChanged ентити не был найден. ${msg.item}`);
      return;
    }

    const old = item.description;

    item.description = msg.description;

    this.events.emit("DescriptionChanged", item, old);
  }
}
