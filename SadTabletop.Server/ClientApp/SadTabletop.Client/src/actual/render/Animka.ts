import type MainScene from "@/actual/render/MainScene.ts";
import type RenderObjectRepresentation from "./RenderObjectRepresentation";
import CardObject from "./objects/CardObject";

const moveKey = "AnimkaMove";

export default class Animka {
  private readonly scene: MainScene;

  readonly speedPerUnit = 1.3;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public moveObjectToObject(obj: RenderObjectRepresentation, target: RenderObjectRepresentation, continuation: (() => void) | null = null): void {

    const location = target.getCurrentPosition();

    this.moveObject2(obj, location.x, location.y, continuation);
  }

  public moveObject2(obj: RenderObjectRepresentation, x: number, y: number, continuation: (() => void) | null = null): void {

    // const start = obj.getCurrentPosition();
    // const end = start.clone().add({
    //   x: x,
    //   y: y
    // });

    const current = obj.getCurrentPosition();

    // TODO лишнее
    const distance = current.distance(new Phaser.Math.Vector2(x, y));
    const time = distance / this.speedPerUnit;

    const data = obj.getDataManager();
    const moveData = data.get(moveKey);

    if (moveData !== undefined) {
      const moveTween = moveData as Phaser.Tweens.Tween;

      moveTween.stop();
      moveTween.destroy();

      data.remove(moveKey);
    }

    const holder = {
      obj,
      x: current.x,
      y: current.y
    };

    const tween = this.scene.tweens.add({
      targets: holder,
      duration: time,
      onComplete: function () {

        data.remove(moveKey);

        if (continuation === null) {
          return;
        }

        continuation();
      },
      onUpdate: function (tween, target, key, current, previous, param) {
        if (holder.obj.destroyed) {
          tween.stop();
          tween.destroy();
          return;
        }

        holder.obj.changePosition(holder.x, holder.y);
      },
      props: {
        x: x,
        y: y
      }
    });

    data.set(moveKey, tween);
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
