import type Flipness from "../../Flipness";
import type TableItem from "../Table/TableItem";
import type CardFaceComplicated from "../Cards/CardFaceComplicated";
import type DeckCardInfo from "./DeckCardInfo";

export default interface Deck extends TableItem {
  side: CardFaceComplicated | null;

  flipness: Flipness;

  cardsCount: number;
  cards: DeckCardInfo[] | null;
}
