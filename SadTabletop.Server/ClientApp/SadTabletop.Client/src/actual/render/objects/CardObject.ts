import type Card from "@/actual/things/concrete/Card";
import type MainScene from "../MainScene";
import Flipness from "@/actual/things/Flipness";
import type RenderObjectRepresentation from "@/actual/render/RenderObjectRepresentation.ts";

const width = 250;
const height = 350;

export default class CardObject implements RenderObjectRepresentation {

  readonly card: Card;

  readonly scene: MainScene;

  readonly sprite: Phaser.GameObjects.Sprite;

  readonly gameObject: object;

  constructor(card: Card, scene: MainScene, sprite: Phaser.GameObjects.Sprite) {
    this.gameObject = card;
    this.card = card;
    this.scene = scene;
    this.sprite = sprite;
  }

  public static create(card: Card, scene: MainScene) {

    const sideTexture = card.flipness === Flipness.Shown ? CardObject.getCardSideTexture(card.frontSide, "defaultFrontSide", scene)
      : CardObject.getCardSideTexture(card.backSide, "defaultBackSide", scene);

    const cardSprite = new Phaser.GameObjects.Sprite(scene, card.x, card.y, sideTexture);
    cardSprite.setDisplaySize(width, height);
    scene.add.existing(cardSprite);

    const obj = new CardObject(card, scene, cardSprite);

    return obj;
  }

  public destroy() {
    this.sprite.destroy();
  }

  static getCardSideTexture(num: number | null, fallback: string, scene: MainScene) {

    if (num === null) {
      return scene.textures.get(fallback);
    }

    const cardId = `card${num}`;

    if (scene.textures.exists(cardId))
      return scene.textures.get(cardId);

    return scene.textures.get(fallback);
  }
}
