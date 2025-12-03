import type Flipness from "../../Flipness";
import type TableItem from "../../TableItem";
import type CardFaceComplicated from "./CardFaceComplicated";

export default interface Card extends TableItem {
  frontSide: CardFaceComplicated | null;
  backSide: CardFaceComplicated;
  flipness: Flipness;
}
