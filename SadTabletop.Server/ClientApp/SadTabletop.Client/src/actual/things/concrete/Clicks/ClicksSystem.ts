import type Table from "@/actual/things/concrete/Table/Table";
import type Connection from "@/communication/Connection";
import type TypedEmitter from "@/utilities/TypedEmiiter";
import type ItemClickyMessage from "./messages/server/ItemClickyMessage";
import { removeFromCollection, removeItemFromCollection } from "@/utilities/MyCollections";
import type ClickMessage from "./messages/client/ClickMessage";
import { findClicky, isClicky } from "@/utilities/Componenter";
import type ClickComponent from "./ClickComponent";
import type TableItem from "../Table/TableItem";

type MessageEvents = {
  ItemClickyChanged(item: TableItem, isClicky: boolean): void;
}

export default class ClicksSystem {

  readonly table: Table;

  readonly events: TypedEmitter<MessageEvents> = new Phaser.Events.EventEmitter();

  connection: Connection | undefined;

  constructor(table: Table) {
    this.table = table;
  }

  subscribeToConnection(connection: Connection) {
    this.connection = connection;
    connection.registerForMessage<ItemClickyMessage>("ItemClickyMessage", (msg) => this.itemClickyChanged(msg));
  }

  clickyClicked(item: TableItem) {

    const component = findClicky(item);
    if (component === undefined) {
      console.warn(`clickyClicked странна ${item}`);
      return;
    }

    if (component.singleUse) {
      removeItemFromCollection(item.components, component);

      if (!isClicky(item)) {
        this.events.emit("ItemClickyChanged", item, false);
      }
    }

    const message: ClickMessage = {
      item: item.id,
      clickId: component.id,
    };

    this.connection?.sendMessage("ClickMessage", message);
  }

  private itemClickyChanged(msg: ItemClickyMessage): void {

    const item = this.table.entities.find(i => i.id == msg.item);
    if (item === undefined) {
      console.error(`не удалось найти итем ${msg.item} itemClickyChanged`);
      return;
    }

    const wasClicky = isClicky(item);

    if (msg.isClicky) {
      const component: ClickComponent = {
        id: msg.component,
        type: "ClickComponent",
        singleUse: msg.singleUse === true
      };
      item.components.push(component);
    }
    else {

      const existing = removeFromCollection(item.components, c => c.id === msg.component);

      if (existing === undefined) {
        console.warn(`не нашли клики компонент ${msg.component} ${item}`);
      }
    }

    if (wasClicky === msg.isClicky) {
      return;
    }

    this.events.emit("ItemClickyChanged", item, msg.isClicky);
  }
}
