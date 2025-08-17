import type Flipness from "../Flipness";
import type TableItem from "../TableItem";

export default interface Card extends TableItem {
  frontSide: number | null;
  backSide: number;
  flipness: Flipness;
}
