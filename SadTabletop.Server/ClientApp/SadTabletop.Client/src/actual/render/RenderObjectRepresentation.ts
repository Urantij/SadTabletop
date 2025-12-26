import type TableItem from "../things/concrete/Table/TableItem";

export default interface RenderObjectRepresentation {
  gameObject: TableItem;

  clicky: boolean;

  destroyed: boolean;

  // :)
  readonly cashbackNaVse: {
    [key: string]: object;
  };

  getDataManager(): Phaser.Data.DataManager;

  getCurrentPosition(): Phaser.Math.Vector2;

  changePosition(x: number, y: number): void;

  setFunnyScale(scale: number): void;

  updateClicky(clicky: boolean): void;

  positionTest(x: number, y: number): boolean;

  // я устау xd
  getPreFx(): Phaser.GameObjects.Components.FX | null;

  isDraggable(): boolean;

  destroy(): void;
}
