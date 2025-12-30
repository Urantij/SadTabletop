import { isClicky } from "@/utilities/Componenter";
import type RenderObjectRepresentation from "./RenderObjectRepresentation";
import type TableItem from "../things/concrete/Table/TableItem";

export const ContainerObjectDataKey = "gameObject";

type RenderMinimum = Phaser.GameObjects.GameObject &
  Phaser.GameObjects.Components.Transform &
  Phaser.GameObjects.Components.GetBounds &
  Phaser.GameObjects.Components.PostPipeline;

export default class SimpleRenderObjectRepresentation<TGameObj extends TableItem, TRender extends RenderMinimum> implements RenderObjectRepresentation {
  readonly gameObject: TGameObj;

  readonly sprite: TRender;

  readonly needInteraction: boolean;

  clicky: boolean = false;

  destroyed: boolean = false;

  readonly baseScale: number;

  // кто нибудь объяснит мне почему я это сделал?
  readonly cashbackNaVse: { [key: string]: object; } = {};

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

  getPreFx(): Phaser.GameObjects.Components.FX | null {
    return this.sprite.preFX;
  }

  setData<T>(key: string | T, data?: any): void {
    this.sprite.setData(key, data);
  }

  getData(key: string | string[]) {
    this.sprite.getData(key);
  }

  removeData(key: string | string[]): void {
    this.sprite.data.remove(key);
  }

  getCurrentPosition(): Phaser.Math.Vector2 {
    return this.sprite.getWorldPoint();
  }

  changePosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
  }

  /**
   * Для отображения спрайтов не их заданной длины, фазер юзает скейл.
   * Я тоже хочу скейлить, но в фазере тока 1 поле скейла.
   * @param scale
   */
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

  positionTest(x: number, y: number): boolean {
    return this.sprite.getBounds().contains(x, y);
  }

  isDraggable(): boolean {
    return false;
  }

  destroy(): void {
    this.destroyed = true;
    this.sprite.destroy();
  }
}
