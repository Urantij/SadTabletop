import type Connection from "@/communication/Connection";
import Table from "./Table";
import type EntityAddedMessage from "@/communication/messages/server/EntityAddedMessage";
import type EntityRemovedMessage from "@/communication/messages/server/EntityRemovedMessage";
import type JoinedMessage from "@/communication/messages/server/JoinedMessage";
import type AssetInfo from "./things/AssetInfo";
import type ItemMovedMessage from "@/communication/messages/server/ItemMovedMessage";
import type TableItem from "./things/TableItem";

/**
 * Хранит все данные игры.
 */
export default class LeGame {

  public readonly table: Table = new Table();

  public readonly sidesData: { num: number; path: string }[] = [];
  public readonly assetsData: { name: string; url: string }[] = [];

  constructor() {
  }

  subscribeToConnection(connection: Connection) {
    connection.events.once("MeJoined", (data) => this.meJoined(data));
    connection.events.on("EntityAdded", (data) => this.entityAdded(data));
    connection.events.on("EntityRemoved", (data) => this.entityRemoved(data));

    this.table.subscribeToConnection(connection);
  }

  private meJoined(data: JoinedMessage): void {
    for (const entity of data.entities) {
      if (this.table.isTableEntityByType(entity.type)) {

        this.table.addItem(entity as TableItem);
      }
      else if (entity.type === "AssetInfo") {

        const info = entity as AssetInfo;
        this.assetsData.push({
          name: info.name,
          url: info.url
        });
      }
    }
  }

  private entityAdded(data: EntityAddedMessage): void {
    if (this.table.isTableEntityByType(data.entity.type)) {
      this.table.addItem(data.entity as TableItem);
    }
  }

  private entityRemoved(data: EntityRemovedMessage): void {
    if (this.table.isTableEntityByType(data.entity.type)) {
      this.table.removeItem(data.entity.id);
    }
  }
}
