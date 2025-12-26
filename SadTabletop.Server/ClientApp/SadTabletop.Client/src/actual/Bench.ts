import type TypedEmitter from "@/utilities/TypedEmiiter";
import type Seat from "./things/Seat";
import type Connection from "@/communication/Connection";
import EntitiesSystem from "./things/EntitiesSystem";

type BenchEvents = {
  SeatAdded: (seat: Seat) => void;
}

interface TakeSeatMessage {
  seatId: number | null;
}

/**
 * Хранит стулья...
 */
export default class Bench extends EntitiesSystem<Seat> {

  private connection: Connection | null = null;

  readonly events: TypedEmitter<BenchEvents> = new Phaser.Events.EventEmitter();

  subscribeToConnection(connection: Connection) {
    this.connection = connection;
  }

  sendTakeSeat(seat: Seat | null) {
    const msg: TakeSeatMessage = {
      seatId: seat?.id ?? null
    };

    this.connection?.sendMessage("TakeSeatMessage", msg);
  }

  override isIncludedEntityByType(type: string) {
    return ["Seat"].includes(type);
  }

  /**
   * Добавить ентити без ивента
   * @param seat
   */
  preAddSeat(seat: Seat) {
    this.entities.push(seat);
  }

  announceSeat(seat: Seat) {
    this.events.emit("SeatAdded", seat);
  }

  addSeat(seat: Seat) {
    this.entities.push(seat);
    this.events.emit("SeatAdded", seat);
  }
}
