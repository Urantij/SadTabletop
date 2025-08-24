import type MainScene from "../MainScene";
import Flipness from "@/actual/things/Flipness";
import type RenderObjectRepresentation from "@/actual/render/RenderObjectRepresentation.ts";
import type Entity from "@/actual/things/Entity";
import type Card from "@/actual/things/concrete/Cards/Card";

export const cardWidth = 250;
export const cardHeight = 350;

export const defaultBackSideKey = "defaultBackSide";
export const defaultFrontSidekey = "defaultFrontSide";

export default class CardObject implements RenderObjectRepresentation {

  readonly card: Card;

  readonly scene: MainScene;

  readonly sprite: Phaser.GameObjects.Sprite;

  readonly gameObject: Entity;

  constructor(card: Card, scene: MainScene, sprite: Phaser.GameObjects.Sprite) {
    this.gameObject = card;
    this.card = card;
    this.scene = scene;
    this.sprite = sprite;
  }

  getCurrentPosition(): Phaser.Math.Vector2 {
    return this.sprite.getWorldPoint();
  }
  changePosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
  }

  public static create(card: Card, scene: MainScene, x: number | null = null, y: number | null = null) {

    const fallback = card.flipness === Flipness.Shown ? defaultFrontSidekey : defaultBackSideKey;
    const sideTexture = card.flipness === Flipness.Shown ? CardObject.getCardSideTexture(card.frontSide, fallback, scene)
      : CardObject.getCardSideTexture(card.backSide, fallback, scene);

    const cardSprite = new Phaser.GameObjects.Sprite(scene, x ?? card.x, y ?? card.y, sideTexture);
    cardSprite.setDisplaySize(cardWidth, cardHeight);
    scene.add.existing(cardSprite);

    const obj = new CardObject(card, scene, cardSprite);

    return obj;
  }

  public destroy() {
    this.sprite.destroy();
  }

  getCardSideTexture() {
    const side = this.card.flipness === Flipness.Shown ? this.card.frontSide : this.card.backSide;
    const fallback = this.card.flipness === Flipness.Shown ? defaultFrontSidekey : defaultBackSideKey;

    return CardObject.getCardSideTexture(side, fallback, this.scene);
  }

  // мне впадлу сделать нормально унифицировано похуй.

  static getCardSideTextureKey(num: number | null, fallback: string, scene: MainScene) {
    if (num === null) {
      return fallback;
    }

    const cardId = `card${num}`;
    if (scene.textures.exists(cardId))
      return cardId;

    return fallback;
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
