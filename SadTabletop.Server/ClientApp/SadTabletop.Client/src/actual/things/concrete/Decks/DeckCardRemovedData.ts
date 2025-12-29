import type Deck from "./Deck";

/**
 * Предмет ето карта которую достали из деки в етой дате
 */
export default class DeckCardRemovedData {
  readonly deck: Deck

  constructor(deck: Deck) {
    this.deck = deck;
  }
}
