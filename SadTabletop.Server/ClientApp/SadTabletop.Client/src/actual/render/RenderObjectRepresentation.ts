import type TableItem from "../things/TableItem";

export default interface RenderObjectRepresentation {
  gameObject: TableItem;

  clicky: boolean;

  destroyed: boolean;

  getDataManager(): Phaser.Data.DataManager;

  getCurrentPosition(): Phaser.Math.Vector2;

  changePosition(x: number, y: number): void;

  setFunnyScale(scale: number): void;

  updateClicky(clicky: boolean): void;

  positionTest(x: number, y: number): boolean;

  isDraggable(): boolean;

  destroy(): void;
}
