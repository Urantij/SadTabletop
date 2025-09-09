import type MainScene from "../MainScene";
import Flipness from "@/actual/things/Flipness";
import type Card from "@/actual/things/concrete/Cards/Card";
import SimpleRenderObjectRepresentation from "../SimpleRenderObjectRepresentation";
import { findComponent, findComponentForSure } from "@/utilities/Componenter";
import type { InHandComponent } from "@/actual/things/concrete/Hands/InHandComponent";
import GameValues from "@/actual/GameValues";
import type Hand from "@/actual/things/concrete/Hands/Hand";

export const cardWidth = 250;
export const cardHeight = 350;

export const defaultBackSideKey = "defaultBackSide";
export const defaultFrontSidekey = "defaultFrontSide";

export default class CardObject extends SimpleRenderObjectRepresentation {

  declare readonly gameObject: Card;

  readonly scene: MainScene;

  constructor(card: Card, scene: MainScene, sprite: Phaser.GameObjects.Sprite) {
    super(card, sprite, false);
    this.scene = scene;
  }

  public static create(card: Card, scene: MainScene, x: number | null = null, y: number | null = null) {

    const fallback = card.flipness === Flipness.Shown ? defaultFrontSidekey : defaultBackSideKey;
    const sideTexture = card.flipness === Flipness.Shown ? CardObject.getCardSideTexture(card.frontSide, fallback, scene)
      : CardObject.getCardSideTexture(card.backSide, fallback, scene);

    const cardSprite = new Phaser.GameObjects.Sprite(scene, x ?? card.x, y ?? card.y, sideTexture);
    cardSprite.setDisplaySize(cardWidth, cardHeight);
    scene.add.existing(cardSprite);

    const obj = new CardObject(card, scene, cardSprite);

    scene.leGame.hands.events.on("CardMovedToHand", obj.moveToHand, obj);
    scene.leGame.hands.events.on("CardRemovedFromHand", obj.removeFromHand, obj);
    scene.leGame.hands.events.on("CardsSwapped", obj.swapInHands, obj);

    return obj;
  }

  private moveToHand(movingCard: Card) {
    if (movingCard !== this.gameObject)
      return;

    const component = findComponentForSure<InHandComponent>(this.gameObject, "InHandComponent");

    const position = GameValues.calculateCardPosition(this.scene.leGame.bench, component);
    this.changePosition(position.x, position.y);
  }

  private removeFromHand(movingCard: Card, hand: Hand) {

    const component = findComponent<InHandComponent>(this.gameObject, "InHandComponent");

    if (component?.hand !== hand)
      return;

    if (movingCard !== this.gameObject) {
      const position = GameValues.calculateCardPosition(this.scene.leGame.bench, component);
      this.changePosition(position.x, position.y);

      return;
    }

    this.changePosition(movingCard.x, movingCard.y);
  }

  private swapInHands(movingCard1: Card, movingCard2: Card) {
    if (movingCard1 !== this.gameObject && movingCard2 !== this.gameObject)
      return;

    const component = findComponentForSure<InHandComponent>(this.gameObject, "InHandComponent");

    const position = GameValues.calculateCardPosition(this.scene.leGame.bench, component);
    this.changePosition(position.x, position.y);
  }

  getCardSideTexture() {
    const side = this.gameObject.flipness === Flipness.Shown ? this.gameObject.frontSide : this.gameObject.backSide;
    const fallback = this.gameObject.flipness === Flipness.Shown ? defaultFrontSidekey : defaultBackSideKey;

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

  override destroy(): void {
    super.destroy();

    this.scene.leGame.hands.events.off("CardMovedToHand", this.moveToHand, this);
    this.scene.leGame.hands.events.off("CardRemovedFromHand", this.moveToHand, this);
    this.scene.leGame.hands.events.off("CardsSwapped", this.moveToHand, this);
  }
}
