import type Entity from "./Entity";
import type SeatColor from "./SeatColor";

export default interface Seat extends Entity {
  color: SeatColor;
}
