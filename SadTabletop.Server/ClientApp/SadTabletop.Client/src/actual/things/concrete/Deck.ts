import type Flipness from "../Flipness";
import type TableItem from "../TableItem";
import type DeckCardInfo from "./DeckCardInfo";

export default interface Deck extends TableItem {
  backSide: number | null;
  frontSide: number | null;

  flipness: Flipness;

  cardsCount: number;
  cards: DeckCardInfo[] | null;
}
