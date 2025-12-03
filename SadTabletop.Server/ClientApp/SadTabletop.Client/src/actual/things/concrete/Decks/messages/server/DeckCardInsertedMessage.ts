import type CardFaceComplicated from "../../../Cards/CardFaceComplicated";

export default interface DeckCardInsertedMessage {
  deck: number;
  card: number;

  side: CardFaceComplicated | number | null;

  cardFront: CardFaceComplicated | number | null;
  deckIndex: number | null;
}
