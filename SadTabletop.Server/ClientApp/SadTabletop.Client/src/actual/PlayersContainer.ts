import type TypedEmitter from "@/utilities/TypedEmiiter";
import type Connection from "@/communication/Connection";
import type Player from "./things/Player";
import type LeGame from "./LeGame";
import type PlayerJoinedMessage from "@/communication/messages/server/PlayerJoinedMessage";
import type Seat from "./things/Seat";
import type PlayerInfo from "@/communication/models/PlayerInfo";
import type PlayerTookSeatMessage from "@/communication/messages/server/PlayerTookSeatMessage";
import type PlayerLeftMessage from "@/communication/messages/server/PlayerLeftMessage";
import type PlayerChangedNameMessage from "@/communication/messages/server/PlayerChangedNameMessage";
import type YouTookSeatMessage from "@/communication/messages/server/YouTookSeatMessage";
import type { CursorsInfoMessage } from "@/communication/messages/server/CursorsInfoMessage";

type MessageEvents = {
  PlayerAdded: (player: Player) => void;
  PlayerRemoved: (Player: Player) => void;
  PlayerSeatChanged: (player: Player) => void;
  PlayerNameChanged: (player: Player) => void;
  CursorMoved: (player: Player) => void;
}

export default class PlayersContainer {
  readonly players: Player[] = [];

  readonly events: TypedEmitter<MessageEvents> = new Phaser.Events.EventEmitter();

  readonly leGame: LeGame;

  constructor(leGame: LeGame) {
    this.leGame = leGame;
  }

  subscribeToConnection(connection: Connection) {

    connection.registerForMessage<PlayerJoinedMessage>("PlayerJoinedMessage", (msg) => this.playerJoined(msg));
    connection.registerForMessage<PlayerLeftMessage>("PlayerLeftMessage", (msg) => this.playerLeft(msg));

    connection.registerForMessage<PlayerTookSeatMessage>("PlayerTookSeatMessage", (msg) => this.playerTookSeat(msg));
    connection.registerForMessage<PlayerChangedNameMessage>("PlayerChangedNameMessage", (msg) => this.playerChangedName(msg));
    connection.registerForMessage<YouTookSeatMessage>("YouTookSeatMessage", (msg) => this.youTookSeatMessage(msg));

    connection.registerForMessage<CursorsInfoMessage>("CursorsInfoMessage", (msg) => this.cursorsInfoMessage(msg));
  }

  addPlayer(playerInfo: PlayerInfo) {
    let seat: Seat | null = null;
    if (playerInfo.seatId !== null) {
      seat = this.leGame.bench.entities.find(s => s.id === playerInfo.seatId) ?? null;
    }

    const player: Player = {
      id: playerInfo.id,
      name: playerInfo.name,
      seat: seat,
      cursor: {
        id: -1,
        components: [],
        type: "Cursor",
        x: 0,
        y: 0,
        description: null
      }
    };

    this.players.push(player);

    this.events.emit("PlayerAdded", player);
  }

  isSeatBusy(seat: Seat) {
    return this.players.findIndex(p => p.seat === seat) != -1;
  }

  private playerJoined(msg: PlayerJoinedMessage): void {
    this.addPlayer({
      id: msg.id,
      name: msg.name,
      seatId: msg.seatId
    });
  }

  private playerLeft(msg: PlayerLeftMessage): void {
    const playerIndex = this.players.findIndex(p => p.id === msg.id);

    if (playerIndex === -1) {
      console.warn(`playerLeft не удалось найти игрока с айди ${msg.id}`);
      return;
    }

    const player = this.players.splice(playerIndex, 1)[0];

    this.events.emit("PlayerRemoved", player);
  }

  private playerTookSeat(msg: PlayerTookSeatMessage): void {
    const player = this.players.find(p => p.id === msg.playerId);

    if (player === undefined) {
      console.warn(`playerTookSeat не нашолся игрок ${msg.playerId}`);
      return;
    }

    let seat: Seat | null = null;
    if (msg.seatId !== null) {
      seat = this.leGame.bench.entities.find(s => s.id === msg.seatId) ?? null;
    }

    player.seat = seat;

    this.events.emit("PlayerSeatChanged", player);
  }

  private playerChangedName(msg: PlayerChangedNameMessage): void {
    const player = this.players.find(p => p.id === msg.playerId);

    if (player === undefined) {
      console.warn(`playerChangedName не нашолся игрок ${msg.playerId}`);
      return;
    }

    player.name = msg.newName;

    this.events.emit("PlayerNameChanged", player);
  }

  private youTookSeatMessage(msg: YouTookSeatMessage): void {

    if (this.leGame.ourPlayer === null)
      return;

    let seat: Seat | null = null;

    if (msg.seatId !== null) {
      seat = this.leGame.bench.entities.find(s => s.id === msg.seatId) ?? null;

      if (seat === null) {
        console.warn(`не удалось найти стул ${msg.seatId} youTookSeatMessage`);
        return;
      }
    }

    this.leGame.ourPlayer.seat = seat;
    this.events.emit("PlayerSeatChanged", this.leGame.ourPlayer);
  }

  private cursorsInfoMessage(msg: CursorsInfoMessage) {
    for (const cursorInfo of msg.cursors) {

      const player = this.players.find(p => p.id === cursorInfo.playerId);

      if (player === undefined) {
        console.warn(`при курсоре непонятный плеер ${cursorInfo.playerId}`);
        continue;
      }

      player.cursor.x = cursorInfo.x;
      player.cursor.y = cursorInfo.y;

      this.events.emit("CursorMoved", player);
    }
  }
}
