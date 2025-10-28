import type TypedEmitter from "@/utilities/TypedEmiiter";
import type Seat from "./things/Seat";
import type Connection from "@/communication/Connection";

type BenchEvents = {
  SeatAdded: (seat: Seat) => void;
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

  readonly events: TypedEmitter<BenchEvents> = new Phaser.Events.EventEmitter();

  subscribeToConnection(connection: Connection) {
    this.connection = connection;
  }

  clear() {
    this.seats.splice(0);
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

  /**
   * Добавить ентити без ивента
   * @param seat
   */
  preAddSeat(seat: Seat) {
    this.seats.push(seat);
  }

  announceSeat(seat: Seat) {
    this.events.emit("SeatAdded", seat);
  }

  addSeat(seat: Seat) {
    this.seats.push(seat);
    this.events.emit("SeatAdded", seat);
  }
}
