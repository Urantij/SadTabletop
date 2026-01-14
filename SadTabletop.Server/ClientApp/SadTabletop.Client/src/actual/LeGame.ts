import type TypedEmitter from "@/utilities/TypedEmiiter";
import type Connection from "@/communication/Connection";
import Table from "./things/concrete/Table/Table";
import type EntityAddedMessage from "@/communication/messages/server/EntityAddedMessage";
import type EntityRemovedMessage from "@/communication/messages/server/EntityRemovedMessage";
import type JoinedMessage from "@/communication/messages/server/JoinedMessage";
import type AssetInfo from "./things/AssetInfo";
import type YouTookSeatMessage from "@/communication/messages/server/YouTookSeatMessage";
import Bench from "./Bench";
import PlayersContainer from "./PlayersContainer";
import type Player from "./things/Player";
import HandsSystem from "./things/concrete/Hands/HandsSystem";
import DragSystem from "./things/concrete/Drag/DragSystem";
import PlayableSystem from "./things/concrete/Playable/PlayableSystem";
import HintsSystem from "./things/concrete/Hints/HintsSystem";
import SettingsSystem from "./things/concrete/Settings/SettingsSystem";
import CardSelectionSystem from "./things/concrete/CardSelection/CardSelectionSystem";
import type { EntitiesBaseSystem } from "./things/EntitiesSystem";
import ChatSystem from "./things/concrete/Chat/ChatSystem";

type LeGameEvents = {
  Clearing: () => void;
  PreDataSet: () => void;
  DataSet: () => void;
}

/**
 * Хранит все данные игры.
 */
export default class LeGame {

  public readonly table: Table = new Table(this);
  public readonly bench: Bench = new Bench();
  public readonly settings: SettingsSystem = new SettingsSystem();

  public readonly cardSelection: CardSelectionSystem = new CardSelectionSystem(this);

  private readonly entitiesSystems: EntitiesBaseSystem[] = [
    this.table,
    this.bench,
    this.settings,
    this.cardSelection
  ];

  public readonly hands: HandsSystem = new HandsSystem(this.table, this.bench);
  public readonly playable: PlayableSystem = new PlayableSystem(this.table, this.bench);

  public readonly hints: HintsSystem = new HintsSystem(this);

  public readonly drags: DragSystem = new DragSystem(this);

  public readonly chatts: ChatSystem = new ChatSystem(this);

  public readonly sidesData: { num: number; path: string }[] = [];
  public readonly assetsData: { id: number, name: string; url: string }[] = [];

  public readonly playersContainer: PlayersContainer = new PlayersContainer(this);

  public readonly events: TypedEmitter<LeGameEvents> = new Phaser.Events.EventEmitter();

  public ourPlayer: Player | null = null;

  public connection: Connection | null = null;

  constructor() {
  }

  subscribeToConnection(connection: Connection) {
    this.connection = connection;

    connection.events.once("MeJoined", (data) => this.meJoined(data));
    connection.events.on("EntityAdded", (data) => this.entityAdded(data));
    connection.events.on("EntityRemoved", (data) => this.entityRemoved(data));

    connection.registerForMessage<YouTookSeatMessage>("YouTookSeatMessage", msg => this.youTookSeatMessage(msg));

    this.table.subscribeToConnection(connection);
    this.bench.subscribeToConnection(connection);
    this.playersContainer.subscribeToConnection(connection);
    this.hands.subscribeToConnection(connection);
    this.playable.subscribeToConnection(connection);
    this.hints.subscribeToConnection(connection);
    this.drags.subscribeToConnection(connection);
    this.chatts.subscribeToConnection(connection);
  }

  private meJoined(data: JoinedMessage): void {

    // у меня голова болит мне не хочется делать нормально
    for (const entity of data.entities) {

      if (entity.type === "AssetInfo") {
        const info = entity as AssetInfo;
        this.assetsData.push({
          id: info.id,
          name: info.name,
          url: info.url
        });
        continue;
      }

      for (const sys of this.entitiesSystems) {
        if (!sys.isIncludedEntityByType(entity.type))
          continue;

        sys.addComplexStage1(entity);
      }
    }

    for (const player of data.players) {
      this.playersContainer.addPlayer(player);
    }
    this.ourPlayer = this.playersContainer.players.find(p => p.id === data.playerId) ?? null;

    for (const entity of data.entities) {
      for (const sys of this.entitiesSystems) {
        if (!sys.isIncludedEntityByType(entity.type))
          continue;

        sys.addComplexStage2(entity);
      }
    }

    this.events.emit("PreDataSet");

    for (const entity of data.entities) {
      for (const sys of this.entitiesSystems) {
        if (!sys.isIncludedEntityByType(entity.type))
          continue;

        sys.addComplexStage3(entity, null);
      }
    }

    this.events.emit("DataSet");
  }

  private entityAdded(data: EntityAddedMessage): void {
    for (const sys of this.entitiesSystems) {
      if (!sys.isIncludedEntityByType(data.entity.type))
        continue;

      sys.addSimple(data.entity, null);
    }
  }

  private entityRemoved(data: EntityRemovedMessage): void {
    for (const sys of this.entitiesSystems) {
      if (!sys.isIncludedEntityByType(data.entity.type))
        continue;

      sys.remove(data.entity.id);
    }
  }

  private youTookSeatMessage(msg: YouTookSeatMessage): void {

    this.events.emit("Clearing");

    for (const sys of this.entitiesSystems) {
      sys.clear();
    }

    // я просто скопировал коуд, так как местами нужно поменять, а делать более женерик я устал
    for (const entity of msg.entities) {
      for (const sys of this.entitiesSystems) {
        if (!sys.isIncludedEntityByType(entity.type))
          continue;

        sys.addComplexStage1(entity);
      }
    }

    this.ourPlayer!.seat = this.bench.entities.find(s => s.id === msg.seatId) ?? null;

    for (const entity of msg.entities) {
      for (const sys of this.entitiesSystems) {
        if (!sys.isIncludedEntityByType(entity.type))
          continue;

        sys.addComplexStage2(entity);
      }
    }

    this.events.emit("PreDataSet");

    for (const entity of msg.entities) {
      for (const sys of this.entitiesSystems) {
        if (!sys.isIncludedEntityByType(entity.type))
          continue;

        sys.addComplexStage3(entity, null);
      }
    }

    this.events.emit("DataSet");
  }
}
