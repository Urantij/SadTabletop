import type Entity from "../things/Entity";

export default interface RenderObjectRepresentation {
  gameObject: Entity;

  getCurrentPosition(): Phaser.Math.Vector2;

  changePosition(x: number, y: number): void;

  destroy(): void;
}
