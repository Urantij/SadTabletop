import type TypedEmitter from "@/utilities/TypedEmiiter";
import type Connection from "@/communication/Connection";
import type DragStartedMessage from "./messages/server/DragStartedMessage";
import type DragEndedMessage from "./messages/server/DragEndedMessage";
import type TableItem from "../Table/TableItem";
import type LeGame from "@/actual/LeGame";
import type Player from "../../Player";
import { findComponent, findComponentForSure, replaceDtoComponent } from "@/utilities/Componenter";
import type { DraggerComponent, DraggerComponentDto } from "./DraggerComponent";
import type Seat from "../../Seat";
import { removeFromCollection } from "@/utilities/MyCollections";
import type StartDragMessage from "./messages/client/StartDragMessage";
import type EndDragMessage from "./messages/client/EndDragMessage";

type DragEvents = {
  DragStarted: (player: Player, item: TableItem) => void;
  DragEnded: (player: Player, item: TableItem) => void;
}

interface DraggedItem {
  player: Player;
  item: TableItem;
}

export default class DragSystem {

  readonly events: TypedEmitter<DragEvents> = new Phaser.Events.EventEmitter();

  readonly leGame: LeGame;

  connection: Connection | null = null;

  readonly draggedItems: DraggedItem[] = [];

  constructor(leGame: LeGame) {
    this.leGame = leGame;
  }

  subscribeToConnection(connection: Connection) {
    this.connection = connection;
    connection.registerForMessage<DragStartedMessage>("DragStartedMessage", msg => this.dragStartedMessage(msg));
    connection.registerForMessage<DragEndedMessage>("DragEndedMessage", msg => this.dragEndedMessage(msg));

    this.leGame.bench.events.on("EntityAdded", (seat) => this.seatAdded(seat));
    this.leGame.playersContainer.events.on("PlayerRemoved", (player) => this.playerRemoved(player));
  }

  startDrag(item: TableItem) {
    const message: StartDragMessage = {
      item: item.id
    };

    this.connection?.sendMessage("StartDragMessage", message);
  }

  endDrag() {
    const message: EndDragMessage = {

    };

    this.connection?.sendMessage("EndDragMessage", message);
  }

  private seatAdded(seat: Seat): void {

    const component = replaceDtoComponent(seat, "DraggerComponent", (dto: DraggerComponentDto) => {

      let item: TableItem | null = null;

      if (dto.item !== null) {
        const foundItem = this.leGame.table.find(dto.item);

        if (foundItem === undefined) {
          console.error(`replaceDtoComponent DraggerComponent ${dto.item}`);
          return;
        }

        item = foundItem;
      }

      const component: DraggerComponent = {
        id: dto.id,
        type: dto.type,
        item: item
      };

      return component;
    });

    if (component === undefined || component.item === null)
      return;

    const player = this.leGame.playersContainer.players.find(p => p.seat === seat);

    if (player === undefined) {
      console.warn(`сит ${seat.id} драгает без плеера`);
      return;
    }

    this.draggedItems.push({
      player: player,
      item: component.item
    });
  }

  private dragStartedMessage(msg: DragStartedMessage): void {
    const player = this.leGame.playersContainer.players.find(p => p.seat?.id === msg.seat);

    if (player === undefined) {
      console.error(`dragStartedMessage игрок не наден ${msg.seat}`);
      return;
    }

    const item = this.leGame.table.find(msg.item);

    if (item === undefined) {
      console.error(`dragStartedMessage item не наден ${msg.item}`);
      return;
    }

    let component = findComponent<DraggerComponent>(player.seat!, "DraggerComponent");

    if (component === undefined) {
      component = {
        id: -1,
        type: "DraggerComponent",
        item: item
      };
      player.seat?.components.push(component);
    }
    else {
      component.item = item;
    }

    this.draggedItems.push({
      player: player,
      item: item
    });

    this.events.emit("DragStarted", player, item);
  }

  private dragEndedMessage(msg: DragEndedMessage): void {
    const player = this.leGame.playersContainer.players.find(p => p.seat?.id === msg.seat);

    if (player === undefined) {
      console.error(`dragEndedMessage игрок не наден ${msg.seat}`);
      return;
    }

    const component = findComponentForSure<DraggerComponent>(player.seat!, "DraggerComponent");

    const item = component.item;

    if (item === null) {
      console.warn(`dragEndedMessage итема нет... ${msg.seat}`);
      return;
    }
    component.item = null;

    removeFromCollection(this.draggedItems, di => di.player === player);

    this.events.emit("DragEnded", player, item);
  }

  private playerRemoved(player: Player): void {
    if (player.seat === null)
      return;

    const component = findComponent<DraggerComponent>(player.seat, "DraggerComponent");

    if (component === undefined)
      return;

    const item = component.item;

    if (item === null) {
      console.warn(`playerRemoved итема нет... ${player.seat.id}`);
      return;
    }
    component.item = null;

    removeFromCollection(this.draggedItems, di => di.player === player);

    this.events.emit("DragEnded", player, item);
  }
}
