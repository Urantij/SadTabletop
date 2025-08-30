import type Connection from "@/communication/Connection";
import Table from "./Table";
import type EntityAddedMessage from "@/communication/messages/server/EntityAddedMessage";
import type EntityRemovedMessage from "@/communication/messages/server/EntityRemovedMessage";
import type JoinedMessage from "@/communication/messages/server/JoinedMessage";
import type AssetInfo from "./things/AssetInfo";
import type TableItem from "./things/TableItem";
import type Entity from "./things/Entity";
import type YouTookSeatMessage from "@/communication/messages/server/YouTookSeatMessage";
import Bench from "./Bench";
import type Seat from "./things/Seat";
import PlayersContainer from "./PlayersContainer";

/**
 * Хранит все данные игры.
 */
export default class LeGame {

  public readonly table: Table = new Table();
  public readonly bench: Bench = new Bench();

  public readonly sidesData: { num: number; path: string }[] = [];
  public readonly assetsData: { name: string; url: string }[] = [];

  public readonly playersContainer: PlayersContainer = new PlayersContainer(this);

  public ourSeat: Seat | null = null;

  constructor() {
  }

  subscribeToConnection(connection: Connection) {
    connection.events.once("MeJoined", (data) => this.meJoined(data));
    connection.events.on("EntityAdded", (data) => this.entityAdded(data));
    connection.events.on("EntityRemoved", (data) => this.entityRemoved(data));

    connection.registerForMessage<YouTookSeatMessage>("YouTookSeatMessage", msg => this.youTookSeatMessage(msg));

    this.table.subscribeToConnection(connection);
    this.bench.subscribeToConnection(connection);
    this.playersContainer.subscribeToConnection(connection);
  }

  private meJoined(data: JoinedMessage): void {
    this.eatEntities(data.entities);

    this.ourSeat = this.bench.seats.find(s => s.id === data.seatId) ?? null;
  }

  private entityAdded(data: EntityAddedMessage): void {
    if (this.table.isTableEntityByType(data.entity.type)) {
      this.table.addItem(data.entity as TableItem, null);
    }
  }

  private entityRemoved(data: EntityRemovedMessage): void {
    if (this.table.isTableEntityByType(data.entity.type)) {
      this.table.removeItem(data.entity.id);
    }
  }

  private eatEntities(entities: Entity[]) {
    for (const entity of entities) {
      if (this.table.isTableEntityByType(entity.type)) {
        this.table.addItem(entity as TableItem, null);
      }
      else if (this.bench.isBenchEntityByType(entity.type)) {
        this.bench.addSeat(entity as Seat);
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

  private youTookSeatMessage(msg: YouTookSeatMessage): void {
    this.table.clear();
    this.bench.clear();
    this.eatEntities(msg.entities);

    this.ourSeat = this.bench.seats.find(s => s.id === msg.seatId) ?? null;
  }
}
