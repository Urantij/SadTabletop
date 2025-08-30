import type Entity from "@/actual/things/Entity";

export default interface YouTookSeatMessage {
  seatId: number | null;
  entities: Entity[];
}
