import type MyTileSprite from "@/actual/things/concrete/Sprites/MyTileSprite";
import SimpleRenderObjectRepresentation from "../SimpleRenderObjectRepresentation";
import type MainScene from "../MainScene";
import { DepthChart } from "../Renderer";

export default class MyTileSpriteObject extends SimpleRenderObjectRepresentation<MyTileSprite, Phaser.GameObjects.TileSprite> {
  static create(data: MyTileSprite, scene: MainScene) {
    const sprite = scene.add.tileSprite(data.x, data.y, data.width, data.height, data.assetName);
    sprite.setDepth(DepthChart.Shapes);

    const result = new MyTileSpriteObject(data, sprite, false);

    if (data.tileX !== null) {
      sprite.tilePositionX = data.tileX;
    }
    if (data.tileY !== null) {
      sprite.tilePositionY = data.tileY;
    }

    if (data.tileScaleX !== null) {
      sprite.tileScaleX = data.tileScaleX;
    }
    if (data.tileScaleY !== null) {
      sprite.tileScaleY = data.tileScaleY;
    }

    return result;
  }
}
