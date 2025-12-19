import type CardFaceComplicated from "../../../Cards/CardFaceComplicated";

export default interface DeckCardInsertedMessage {
  deck: number;
  /**
   * Старый айди карты на столе
   */
  card: number;

  /**
   * Новый айди карты в деке
   */
  cardDeckId: number;

  side: CardFaceComplicated | number | null;

  cardFront: CardFaceComplicated | number | null;
  deckIndex: number | null;
}
