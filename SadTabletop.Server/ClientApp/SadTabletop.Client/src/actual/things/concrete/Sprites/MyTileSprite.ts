import type TableItem from "../Table/TableItem";

export default interface MyTileSprite extends TableItem {
  assetName: string;

  width: number;
  height: number;

  tileX: number | null;
  tileY: number | null;

  tileScaleX: number | null;
  tileScaleY: number | null;
}
