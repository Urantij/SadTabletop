import type MainScene from "../MainScene";
import type TextItem from "@/actual/things/concrete/TextItem";
import SimpleRenderObjectRepresentation from "../SimpleRenderObjectRepresentation";
import { DepthChart } from "../Renderer";

export default class TextItemObject extends SimpleRenderObjectRepresentation<TextItem, Phaser.GameObjects.Text> {

  declare gameObject: TextItem;

  declare sprite: Phaser.GameObjects.Text;

  constructor(gameObject: TextItem, text: Phaser.GameObjects.Text) {
    super(gameObject, text, false);
  }

  static create(gameObject: TextItem, scene: MainScene): TextItemObject {

    const text = new Phaser.GameObjects.Text(scene, gameObject.x, gameObject.y, gameObject.content, {
      fontSize: 30
    });
    text.setDisplaySize(gameObject.width, gameObject.height);
    text.setDepth(DepthChart.Text);
    scene.add.existing(text);

    const result = new TextItemObject(gameObject, text);

    return result;
  }
}
