import type MainScene from "@/actual/render/MainScene.ts";
import type RenderObjectRepresentation from "./RenderObjectRepresentation";

export default class Animka {
  private readonly scene: MainScene;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public moveObject(obj: RenderObjectRepresentation, x: number, y: number, time: number): void {

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
      onUpdate: function (tween, target, key, current, previous, param) {
        holder.obj.changePosition(holder.start.x + holder.xChange, holder.start.y + holder.yChange);
      },
      props: {
        xChange: x - holder.start.x,
        yChange: y - holder.start.y
      }
    });
  }
}
