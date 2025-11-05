import type TableItem from "../../TableItem";

export default interface MySprite extends TableItem {
  assetName: string;
  displayWidth: number | null;
  displayHeight: number | null;
}
