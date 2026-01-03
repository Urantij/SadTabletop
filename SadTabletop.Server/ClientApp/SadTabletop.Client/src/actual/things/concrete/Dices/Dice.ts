import type TableItem from "../Table/TableItem";
import type DiceSide from "./DiceSide";

export default interface Dice extends TableItem {
  currentSideIndex: number | null;
  sides: DiceSide[];
  defaultAssetId: number | null;
}
