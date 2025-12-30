import type RenderObjectRepresentation from "./RenderObjectRepresentation";
import CardObject from "./objects/CardObject";

const moveKey = "AnimkaMove";

export default class Animka {
  private readonly scene: Phaser.Scene;

  readonly speedPerUnit = 1.3;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public moveObjectToObject(obj: RenderObjectRepresentation, target: RenderObjectRepresentation, continuation: (() => void) | null = null): void {

    const location = target.getCurrentPosition();

    this.moveObject2(obj, location.x, location.y, continuation);
  }

  public moveObject2(obj: RenderObjectRepresentation, x: number, y: number, continuation: (() => void) | null = null, speedPerUnit: number | null = null): void {

    // const start = obj.getCurrentPosition();
    // const end = start.clone().add({
    //   x: x,
    //   y: y
    // });

    const scene = this.scene;

    const current = obj.getCurrentPosition();

    // TODO лишнее
    const distance = current.distance(new Phaser.Math.Vector2(x, y));
    const time = distance / (speedPerUnit ?? this.speedPerUnit);

    const moveData = obj.getData(moveKey);

    let passedTime: number | null = null;

    if (moveData !== undefined) {
      const moveTween = moveData.tween as Phaser.Tweens.Tween;
      passedTime = moveData.time;

      moveTween.stop();
      // moveTween.destroy();

      obj.removeData(moveKey);
    }

    const holder = {
      obj,
      x: current.x,
      y: current.y
    };

    const test: {
      tween: Phaser.Tweens.Tween | null,
      time: number
    } = {
      tween: null,
      time: scene.time.now,
    };

    const tween = this.scene.tweens.add({
      targets: holder,
      duration: time,
      paused: true,
      onComplete: function () {

        // я не понимаю почему это началось)
        if (!obj.destroyed)
          obj.removeData(moveKey);

        if (continuation === null) {
          return;
        }

        continuation();
      },
      onUpdate: function (tween, target, key, current, previous, param) {
        if (holder.obj.destroyed) {
          tween.stop();
          // tween.destroy();
          return;
        }

        test.time = scene.time.now;

        holder.obj.changePosition(holder.x, holder.y);
      },
      props: {
        x: x,
        y: y
      }
    });
    test.tween = tween;

    obj.setData(moveData, test);

    tween.play();

    if (passedTime !== null) {
      const p = scene.time.now - passedTime;
      tween.update(p);
    }
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
