import type RectShape from "@/actual/things/concrete/Shapes/RectShape";
import SimpleRenderObjectRepresentation from "../SimpleRenderObjectRepresentation";
import type MainScene from "../MainScene";

export default class RectShapeObject extends SimpleRenderObjectRepresentation {
  static create(shape: RectShape, scene: MainScene) {

    const rectangle = scene.add.rectangle(shape.x, shape.y, shape.width, shape.height, shape.color);

    const result = new RectShapeObject(shape, rectangle, false);

    return result;
  }
}
