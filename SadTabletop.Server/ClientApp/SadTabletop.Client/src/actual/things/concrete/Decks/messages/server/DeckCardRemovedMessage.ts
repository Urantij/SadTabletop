import type Card from "../../../Cards/Card";
import type CardFaceComplicated from "../../../Cards/CardFaceComplicated";

export default interface DeckCardRemovedMessage {
  deck: number;
  card: Card;

  side: CardFaceComplicated | number | null;

  cardDeckId: number | null;
}
