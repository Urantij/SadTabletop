import { isClicky } from "@/utilities/Componenter";
import type RenderObjectRepresentation from "./RenderObjectRepresentation";
import type TableItem from "../things/TableItem";

export const ContainerObjectDataKey = "gameObject";

export default class SimpleRenderObjectRepresentation implements RenderObjectRepresentation {
  readonly gameObject: TableItem;

  readonly sprite: Phaser.GameObjects.Sprite;

  readonly needInteraction: boolean;

  clicky: boolean = false;

  constructor(gameObject: TableItem, sprite: Phaser.GameObjects.Sprite, needInteraction: boolean) {
    this.gameObject = gameObject;
    this.sprite = sprite;
    this.needInteraction = needInteraction;

    this.clicky = isClicky(gameObject);

    if (this.needInteraction || this.clicky) {
      this.sprite.setInteractive();
    }

    this.sprite.setData(ContainerObjectDataKey, this);
  }

  getCurrentPosition(): Phaser.Math.Vector2 {
    return this.sprite.getWorldPoint();
  }
  changePosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
  }
  updateClicky(clicky: boolean): void {
    if (this.needInteraction) {
      return;
    }

    this.clicky = clicky;

    if (clicky) {
      this.sprite.setInteractive();
    }
    else {
      this.sprite.disableInteractive();
    }
  }
  destroy(): void {
    this.sprite.destroy();
  }
}
