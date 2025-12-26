import type TableItem from "../Table/TableItem";

export default interface MySprite extends TableItem {
  assetName: string;
  displayWidth: number | null;
  displayHeight: number | null;
}
