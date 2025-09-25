import type Card from "@/actual/things/concrete/Cards/Card";
import SimpleRenderObjectRepresentation from "../SimpleRenderObjectRepresentation";
import type MainScene from "../MainScene";
import Flipness from "@/actual/things/Flipness";
import CardObject, { defaultFrontSidekey, defaultBackSideKey } from "./CardObject";
import type { InHandComponent } from "@/actual/things/concrete/Hands/InHandComponent";
import type HandScene from "../HandScene";

// почему тут? ну потому что ептыть
export const inhandCardWidth = 250 * 0.8;
export const inhandCardHeight = 350 * 0.8;

export default class InHandCardObject extends SimpleRenderObjectRepresentation<Card, Phaser.GameObjects.Sprite> {

  readonly component: InHandComponent;

  constructor(card: Card, sprite: Phaser.GameObjects.Sprite, component: InHandComponent) {
    super(card, sprite, true);
    this.component = component;
  }

  setDepth(depth: number) {
    this.sprite.setDepth(depth);
  }

  public static create(card: Card, component: InHandComponent, scene: HandScene) {

    const fallback = card.flipness === Flipness.Shown ? defaultFrontSidekey : defaultBackSideKey;
    const sideTexture = card.flipness === Flipness.Shown ? CardObject.getCardSideTexture(card.frontSide, fallback, scene)
      : CardObject.getCardSideTexture(card.backSide, fallback, scene);

    const cardSprite = new Phaser.GameObjects.Sprite(scene, 0, 0, sideTexture);
    cardSprite.setDisplaySize(inhandCardWidth, inhandCardHeight);
    scene.add.existing(cardSprite);

    const config: Phaser.Types.Input.InputConfiguration = {
      draggable: true
    };
    cardSprite.setInteractive(config)
    // scene.input.setDraggable(cardSprite);

    const obj = new InHandCardObject(card, cardSprite, component);

    return obj;
  }

  override isDraggable(): boolean {
    return false;
    // return true;
  }
}
