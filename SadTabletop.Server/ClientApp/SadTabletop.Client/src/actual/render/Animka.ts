import type MainScene from "@/actual/render/MainScene.ts";
import type RenderObjectRepresentation from "./RenderObjectRepresentation";
import CardObject from "./objects/CardObject";

export default class Animka {
  private readonly scene: MainScene;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public moveObjectToObject(obj: RenderObjectRepresentation, target: RenderObjectRepresentation, time: number, continuation: (() => void) | null = null): void {

    const location = target.getCurrentPosition();

    this.moveObject(obj, location.x, location.y, time, continuation);
  }

  public moveObject(obj: RenderObjectRepresentation, x: number, y: number, time: number, continuation: (() => void) | null = null): void {

    // const start = obj.getCurrentPosition();
    // const end = start.clone().add({
    //   x: x,
    //   y: y
    // });

    const holder = {
      obj,
      start: obj.getCurrentPosition(),
      xChange: 0,
      yChange: 0
    };

    this.scene.tweens.add({
      targets: holder,
      duration: time,
      onComplete: function () {
        if (continuation === null) {
          return;
        }

        continuation();
      },
      onUpdate: function (tween, target, key, current, previous, param) {
        if (holder.obj.destroyed) {
          tween.destroy();
          return;
        }

        holder.obj.changePosition(holder.start.x + holder.xChange, holder.start.y + holder.yChange);
      },
      props: {
        xChange: x - holder.start.x,
        yChange: y - holder.start.y
      }
    });
  }

  public flipCard(obj: CardObject) {
    // const currentSideTexture = obj.sprite.texture;
    const newSideTexture = obj.getCardSideTexture();

    const time = 300;

    const target = obj.sprite.displayWidth;

    const tween1: Phaser.Types.Tweens.TweenBuilderConfig = {
      targets: obj.sprite,
      duration: time,
      props: {
        displayWidth: 0
      }
    };
    const tween2: Phaser.Types.Tweens.TweenBuilderConfig = {
      targets: obj.sprite,
      duration: time,
      onStart: (tween) => {
        if (obj.destroyed) {
          tween.destroy();
          return;
        }

        obj.sprite.setTexture(newSideTexture.key);
      },
      props: {
        displayWidth: target
      }
    };

    this.scene.tweens.chain({
      tweens: [
        tween1,
        tween2
      ]
    });
  }
}
