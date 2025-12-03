import type CardFaceComplicated from "../../../Cards/CardFaceComplicated";
import type DeckCardInfo from "../../DeckCardInfo";

export default interface DeckUpdatedMessage {
  deck: number;
  side: CardFaceComplicated | number | null;
  cardsCount: number;
  cards: DeckCardInfo[] | null;
  orderKnown: boolean | null;
}
