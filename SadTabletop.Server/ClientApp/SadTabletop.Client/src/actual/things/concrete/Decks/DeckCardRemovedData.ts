import type Deck from "./Deck";

export default class DeckCardRemovedData {
  readonly deck: Deck

  constructor(deck: Deck) {
    this.deck = deck;
  }
}
