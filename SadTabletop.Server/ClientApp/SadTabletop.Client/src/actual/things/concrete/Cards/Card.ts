import type Flipness from "../../Flipness";
import type TableItem from "../Table/TableItem";
import type CardFaceComplicated from "./CardFaceComplicated";

export default interface Card extends TableItem {
  front: CardFaceComplicated | null;
  back: CardFaceComplicated;
  flipness: Flipness;
}
