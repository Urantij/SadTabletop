import type Seat from "../../Seat";
import type Card from "../Cards/Card";

export default class Hand {

  readonly owner: Seat;

  readonly cards: Card[] = [];

  constructor(owner: Seat) {
    this.owner = owner;
  }
}
