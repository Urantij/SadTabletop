import type Connection from "@/communication/Connection";
import Table from "./Table";
import type EntityAddedMessage from "@/communication/messages/server/EntityAddedMessage";
import type EntityRemovedMessage from "@/communication/messages/server/EntityRemovedMessage";
import type JoinedMessage from "@/communication/messages/server/JoinedMessage";

/**
 * Хранит все данные игры.
 */
export default class LeGame {

  public readonly table: Table = new Table();

  public readonly sidesData: { num: number, path: string }[] = [];

  constructor() {
  }

  subscribeToConnection(connection: Connection) {
    connection.events.once("MeJoined", (data) => this.meJoined(data));
    connection.events.on("EntityAdded", (data) => this.entityAdded(data));
    connection.events.on("EntityRemoved", (data) => this.entityRemoved(data));
  }

  private meJoined(data: JoinedMessage): void {
    for (const entity of data.entities) {
      if (this.table.isTableEntityByType(entity.type)) {
        this.table.addEntity(entity);
      }
    }
  }

  private entityAdded(data: EntityAddedMessage): void {
    if (this.table.isTableEntityByType(data.entity.type)) {
      this.table.addEntity(data.entity);
    }
  }

  private entityRemoved(data: EntityRemovedMessage): void {
    if (this.table.isTableEntityByType(data.entity.type)) {
      this.table.removeEntity(data.entity.id);
    }
  }
}
