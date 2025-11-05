import type MySprite from "@/actual/things/concrete/Sprites/MySprite";
import SimpleRenderObjectRepresentation from "../SimpleRenderObjectRepresentation";
import type MainScene from "../MainScene";
import { DepthChart } from "../Renderer";

export default class MySpriteObject extends SimpleRenderObjectRepresentation<MySprite, Phaser.GameObjects.Sprite> {
  static create(data: MySprite, scene: MainScene) {
    const sprite = scene.add.sprite(data.x, data.y, data.assetName);
    sprite.setDepth(DepthChart.Shapes);

    const result = new MySpriteObject(data, sprite, false);

    if (data.displayWidth !== null) {
      sprite.displayWidth = data.displayWidth;
    }
    if (data.displayHeight !== null) {
      sprite.displayHeight = data.displayHeight;
    }

    return result;
  }
}
