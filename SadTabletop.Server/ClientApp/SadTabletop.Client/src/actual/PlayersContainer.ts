import type TypedEmitter from "@/utilities/TypedEmiiter";
import type Connection from "@/communication/Connection";
import type Player from "./things/Player";
import type LeGame from "./LeGame";
import type JoinedMessage from "@/communication/messages/server/JoinedMessage";
import type PlayerJoinedMessage from "@/communication/messages/server/PlayerJoinedMessage";
import type Seat from "./things/Seat";
import type PlayerInfo from "@/communication/models/PlayerInfo";
import type PlayerTookSeatMessage from "@/communication/messages/server/PlayerTookSeatMessage";
import type PlayerLeftMessage from "@/communication/messages/server/PlayerLeftMessage";

type MessageEvents = {
  PlayerAdded: (player: Player) => void;
  PlayerRemoved: (Player: Player) => void;
  PlayerSeatChanged: (player: Player) => void;
}

export default class PlayersContainer {
  readonly players: Player[] = [];

  readonly events: TypedEmitter<MessageEvents> = new Phaser.Events.EventEmitter();

  readonly leGame: LeGame;

  constructor(leGame: LeGame) {
    this.leGame = leGame;
  }

  subscribeToConnection(connection: Connection) {

    connection.registerForMessage<JoinedMessage>("JoinedMessage", (msg) => this.joined(msg));

    connection.registerForMessage<PlayerJoinedMessage>("PlayerJoinedMessage", (msg) => this.playerJoined(msg));
    connection.registerForMessage<PlayerLeftMessage>("PlayerLeftMessage", (msg) => this.playerLeft(msg));

    connection.registerForMessage<PlayerTookSeatMessage>("PlayerTookSeatMessage", (msg) => this.playerTookSeat(msg));
  }

  addPlayer(playerInfo: PlayerInfo) {
    let seat: Seat | null = null;
    if (playerInfo.seatId !== null) {
      seat = this.leGame.bench.seats.find(s => s.id === playerInfo.seatId) ?? null;
    }

    const player: Player = {
      id: playerInfo.id,
      name: playerInfo.name,
      seat: seat
    };

    this.players.push(player);

    this.events.emit("PlayerAdded", player);
  }

  private joined(msg: JoinedMessage): void {
    for (const playerInfo of msg.players) {
      this.addPlayer(playerInfo);
    }
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
      seat = this.leGame.bench.seats.find(s => s.id === msg.seatId) ?? null;
    }

    player.seat = seat;

    this.events.emit("PlayerSeatChanged", player);
  }
}
