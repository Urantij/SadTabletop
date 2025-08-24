import type Card from "../../../Cards/Card";

export default interface DeckCardRemovedMessage {
  deck: number;
  card: Card;

  side: number | null;

  cardIndex: number | null;
}
