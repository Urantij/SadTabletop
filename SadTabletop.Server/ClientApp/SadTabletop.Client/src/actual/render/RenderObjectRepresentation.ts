import type TableItem from "../things/TableItem";

export default interface RenderObjectRepresentation {
  gameObject: TableItem;

  clicky: boolean;

  destroyed: boolean;

  getCurrentPosition(): Phaser.Math.Vector2;

  changePosition(x: number, y: number): void;

  updateClicky(clicky: boolean): void;

  destroy(): void;
}
