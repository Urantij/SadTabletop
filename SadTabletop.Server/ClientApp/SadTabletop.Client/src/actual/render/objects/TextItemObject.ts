import type MainScene from "../MainScene";
import type RenderObjectRepresentation from "../RenderObjectRepresentation";
import type TextItem from "@/actual/things/concrete/TextItem";

export default class TextItemObject implements RenderObjectRepresentation {

  gameObject: TextItem;

  text: Phaser.GameObjects.Text;

  destroyed: boolean = false;

  constructor(gameObject: TextItem, text: Phaser.GameObjects.Text) {
    this.gameObject = gameObject;
    this.text = text;
  }

  static create(gameObject: TextItem, scene: MainScene): TextItemObject {

    const text = new Phaser.GameObjects.Text(scene, gameObject.x, gameObject.y, gameObject.content, {
      fontSize: 30
    });
    text.setDisplaySize(gameObject.width, gameObject.height);
    scene.add.existing(text);

    const result = new TextItemObject(gameObject, text);

    return result;
  }

  getCurrentPosition(): Phaser.Math.Vector2 {
    return this.text.getWorldPoint();
  }

  changePosition(x: number, y: number): void {
    this.text.setPosition(x, y);
  }

  clicky: boolean = false;
  updateClicky(clicky: boolean): void {
    // TODO на подумать
    throw new Error("Method not implemented.");
  }

  destroy(): void {
    this.destroyed = true;
    this.text.destroy();
  }
}
