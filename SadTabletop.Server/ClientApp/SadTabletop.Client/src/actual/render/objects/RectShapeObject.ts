import type RectShape from "@/actual/things/concrete/Shapes/RectShape";
import SimpleRenderObjectRepresentation from "../SimpleRenderObjectRepresentation";
import type MainScene from "../MainScene";
import { DepthChart } from "../Renderer";

export default class RectShapeObject extends SimpleRenderObjectRepresentation<RectShape, Phaser.GameObjects.Rectangle> {
  static create(shape: RectShape, scene: MainScene) {

    const rectangle = scene.add.rectangle(shape.x, shape.y, shape.width, shape.height, shape.color);
    rectangle.setDepth(DepthChart.Shapes);

    const result = new RectShapeObject(shape, rectangle, false);

    return result;
  }
}
