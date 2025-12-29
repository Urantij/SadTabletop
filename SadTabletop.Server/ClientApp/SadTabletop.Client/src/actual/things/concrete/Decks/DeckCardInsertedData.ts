import type Deck from "./Deck";

/**
 * Удалённый предмет ето карта которую положили в ету деку.
 */
export default class DeckCardInsertedData {
  readonly deck: Deck

  constructor(deck: Deck) {
    this.deck = deck;
  }
}
