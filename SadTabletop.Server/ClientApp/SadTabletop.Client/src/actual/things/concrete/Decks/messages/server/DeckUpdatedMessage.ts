import type DeckCardInfo from "../../DeckCardInfo";

export default interface DeckUpdatedMessage {
  deck: number;
  backSide: number | null;
  frontSide: number | null;
  cardsCount: number;
  cards: DeckCardInfo[] | null;
  orderKnown: boolean | null;
}
