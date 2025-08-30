import type Seat from "./Seat";

export default interface Player {
  id: number;
  name: string;
  seat: Seat | null;
}
