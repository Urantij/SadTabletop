import { isClicky } from "@/utilities/Componenter";
import type RenderObjectRepresentation from "./RenderObjectRepresentation";
import type TableItem from "../things/TableItem";

export const ContainerObjectDataKey = "gameObject";

type RenderMinimum = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform;

export default class SimpleRenderObjectRepresentation<TGameObj extends TableItem, TRender extends RenderMinimum> implements RenderObjectRepresentation {
  readonly gameObject: TGameObj;

  readonly sprite: TRender;

  readonly needInteraction: boolean;

  clicky: boolean = false;

  destroyed: boolean = false;

  readonly baseScale: number;

  constructor(gameObject: TGameObj, sprite: TRender, needInteraction: boolean) {
    this.gameObject = gameObject;
    this.sprite = sprite;
    this.baseScale = sprite.scale;
    this.needInteraction = needInteraction;

    this.clicky = isClicky(gameObject);

    if (this.needInteraction || this.clicky) {
      this.sprite.setInteractive();
    }

    this.sprite.setData(ContainerObjectDataKey, this);
  }

  getDataManager() {
    return this.sprite.data;
  }

  getCurrentPosition(): Phaser.Math.Vector2 {
    return this.sprite.getWorldPoint();
  }

  changePosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
  }

  setFunnyScale(scale: number): void {
    this.sprite.setScale(this.baseScale * scale, this.baseScale * scale);
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

  isDraggable(): boolean {
    return false;
  }

  destroy(): void {
    this.destroyed = true;
    this.sprite.destroy();
  }
}
