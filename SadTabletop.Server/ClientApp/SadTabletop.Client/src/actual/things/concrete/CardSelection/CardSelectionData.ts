import type Entity from "../../Entity";
import type Seat from "../../Seat";
import type DeckCardInfo from "../Decks/DeckCardInfo";

export default interface CardSelectionData extends Entity {
  target: Seat;
  minSelect: number;
  maxSelect: number;
  cards: DeckCardInfo[];
}
