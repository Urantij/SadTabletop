import type CircleShape from "@/actual/things/concrete/Shapes/CircleShape";
import SimpleRenderObjectRepresentation from "../SimpleRenderObjectRepresentation";
import type MainScene from "../MainScene";
import { DepthChart } from "../Renderer";

export default class CircleShapeObject extends SimpleRenderObjectRepresentation<CircleShape, Phaser.GameObjects.Arc> {
  static create(shape: CircleShape, scene: MainScene) {

    const circle = scene.add.circle(shape.x, shape.y, shape.radius, shape.color);
    circle.setDepth(DepthChart.Shapes);

    const result = new CircleShapeObject(shape, circle, false);

    return result;
  }
}
