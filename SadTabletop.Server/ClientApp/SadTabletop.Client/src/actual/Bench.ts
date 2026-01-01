import type Seat from "./things/Seat";
import type Connection from "@/communication/Connection";
import EntitiesSystem from "./things/EntitiesSystem";

interface TakeSeatMessage {
  seatId: number | null;
}

/**
 * Хранит стулья...
 */
export default class Bench extends EntitiesSystem<Seat> {

  private connection: Connection | null = null;

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
}
