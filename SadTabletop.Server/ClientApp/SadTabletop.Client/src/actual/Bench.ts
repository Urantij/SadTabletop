import type TypedEmitter from "@/utilities/TypedEmiiter";
import type Seat from "./things/Seat";
import type Connection from "@/communication/Connection";

type MessageEvents = {
  SeatAdded: (seat: Seat) => void;
  Clearing: () => void;
}

interface TakeSeatMessage {
  seatId: number | null;
}

/**
 * Хранит стулья...
 */
export default class Bench {
  readonly seats: Seat[] = [];

  private connection: Connection | null = null;

  readonly events: TypedEmitter<MessageEvents> = new Phaser.Events.EventEmitter();

  subscribeToConnection(connection: Connection) {
    this.connection = connection;
  }

  clear() {
    this.seats.splice(0);
    this.events.emit("Clearing");
  }

  sendTakeSeat(seat: Seat | null) {
    const msg: TakeSeatMessage = {
      seatId: seat?.id ?? null
    };

    this.connection?.sendMessage("TakeSeatMessage", msg);
  }

  isBenchEntityByType(type: string) {
    return ["Seat"].includes(type);
  }

  addSeat(seat: Seat) {
    this.seats.push(seat);
    this.events.emit("SeatAdded", seat);
  }
}
