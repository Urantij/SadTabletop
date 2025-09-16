import type Card from "@/actual/things/concrete/Cards/Card";
import SimpleRenderObjectRepresentation from "../SimpleRenderObjectRepresentation";
import type MainScene from "../MainScene";
import Flipness from "@/actual/things/Flipness";
import CardObject, { defaultFrontSidekey, defaultBackSideKey } from "./CardObject";
import type { InHandComponent } from "@/actual/things/concrete/Hands/InHandComponent";

const inhandCardWidth = 250 * 0.8;
const inhandCardHeight = 350 * 0.8;

export const handPositionX = -10000;
export const handPositionY = -10000;
const handWidth = 600;

export default class InHandCardObject extends SimpleRenderObjectRepresentation {
  declare readonly gameObject: Card;
  declare readonly sprite: Phaser.GameObjects.Sprite;

  readonly component: InHandComponent;

  constructor(card: Card, sprite: Phaser.GameObjects.Sprite, component: InHandComponent) {
    super(card, sprite, true);
    this.component = component;
  }

  setDepth(depth: number) {
    this.sprite.setDepth(depth);
  }

  public static create(card: Card, component: InHandComponent, scene: MainScene) {

    const fallback = card.flipness === Flipness.Shown ? defaultFrontSidekey : defaultBackSideKey;
    const sideTexture = card.flipness === Flipness.Shown ? CardObject.getCardSideTexture(card.frontSide, fallback, scene)
      : CardObject.getCardSideTexture(card.backSide, fallback, scene);

    const pos = InHandCardObject.calculatePosition(component.index, component.hand.cards.length);

    const cardSprite = new Phaser.GameObjects.Sprite(scene, pos.x, pos.y, sideTexture);
    cardSprite.setDisplaySize(inhandCardWidth, inhandCardHeight);
    scene.add.existing(cardSprite);

    const obj = new InHandCardObject(card, cardSprite, component);

    return obj;
  }

  calculatePosition() {
    return InHandCardObject.calculatePosition(this.component.index, this.component.hand.cards.length);
  }

  static calculatePosition(index: number, cardsCount: number) {

    if (cardsCount === 1) {
      return new Phaser.Geom.Point(handPositionX, handPositionY);
    }

    let wholeDisplayWidth = cardsCount * inhandCardWidth;
    let cardDisplayWidth = inhandCardWidth;

    if (wholeDisplayWidth > handWidth) {
      cardDisplayWidth *= handWidth / wholeDisplayWidth;
      wholeDisplayWidth = handWidth;
    }

    // старт + положение карты в массиве - половина отображаемой руки даст нужную позицию. и + половина карты так как ориджин Х 0.5, а не 0
    const x = handPositionX + cardDisplayWidth * index - wholeDisplayWidth / 2 + inhandCardWidth / 2;
    return new Phaser.Geom.Point(x, handPositionY);
  }
}
