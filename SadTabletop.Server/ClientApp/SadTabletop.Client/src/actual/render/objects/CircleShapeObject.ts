import type CircleShape from "@/actual/things/concrete/Shapes/CircleShape";
import SimpleRenderObjectRepresentation from "../SimpleRenderObjectRepresentation";
import type MainScene from "../MainScene";

export default class CircleShapeObject extends SimpleRenderObjectRepresentation {
  static create(shape: CircleShape, scene: MainScene) {

    const circle = scene.add.circle(shape.x, shape.y, shape.radius, shape.color);

    const result = new CircleShapeObject(shape, circle, false);

    return result;
  }
}
