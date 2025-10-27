import Flipness from "@/actual/things/Flipness";
import type Card from "@/actual/things/concrete/Cards/Card";
import SimpleRenderObjectRepresentation from "../SimpleRenderObjectRepresentation";
import { findComponent } from "@/utilities/Componenter";
import type { InHandComponent } from "@/actual/things/concrete/Hands/InHandComponent";
import type BaseScene from "../BaseScene";
import { DepthChart } from "../Renderer";
import type { PlayableComponent } from "@/actual/things/concrete/Playable/PlayableComponent";

export const defaultBackSideKey = "defaultBackSide";
export const defaultFrontSidekey = "defaultFrontSide";

export default class CardObject extends SimpleRenderObjectRepresentation<Card, Phaser.GameObjects.Sprite> {

  readonly scene: BaseScene;

  inhand: InHandComponent | null = null;
  playable: PlayableComponent | null = null;

  // я че то уже устал и не могу
  playableGlow: Phaser.FX.Glow | undefined;

  constructor(card: Card, scene: BaseScene, sprite: Phaser.GameObjects.Sprite) {
    super(card, sprite, false);
    this.scene = scene;
  }

  public static create(card: Card, scene: BaseScene, x: number, y: number, width: number, height: number) {

    const fallback = card.flipness === Flipness.Shown ? defaultFrontSidekey : defaultBackSideKey;
    const sideTexture = card.flipness === Flipness.Shown ? CardObject.getCardSideTexture(card.frontSide, fallback, scene)
      : CardObject.getCardSideTexture(card.backSide, fallback, scene);

    const cardSprite = new Phaser.GameObjects.Sprite(scene, x, y, sideTexture);
    cardSprite.setDepth(DepthChart.Card);
    cardSprite.setDisplaySize(width, height);
    scene.add.existing(cardSprite);

    const obj = new CardObject(card, scene, cardSprite);
    obj.inhand = findComponent<InHandComponent>(card, "InHandComponent") ?? null;
    obj.playable = findComponent<PlayableComponent>(card, "PlayableComponent") ?? null;

    // TODO какой урод должен за это отвечать?

    scene.leGame.table.cards.events.on("CardFrontChanged", obj.cardChanged, obj);

    return obj;
  }

  private cardChanged(changedCard: Card) {
    if (changedCard !== this.gameObject)
      return;

    // TODO бредик
    const texture = this.getCardSideTexture();

    this.sprite.setTexture(texture.key);
  }

  getCardSideTexture() {
    const side = this.gameObject.flipness === Flipness.Shown ? this.gameObject.frontSide : this.gameObject.backSide;
    const fallback = this.gameObject.flipness === Flipness.Shown ? defaultFrontSidekey : defaultBackSideKey;

    return CardObject.getCardSideTexture(side, fallback, this.scene);
  }

  // мне впадлу сделать нормально унифицировано похуй.

  static getCardSideTextureKey(num: number | null, fallback: string, scene: Phaser.Scene) {
    if (num === null) {
      return fallback;
    }

    const cardId = `card${num}`;
    if (scene.textures.exists(cardId))
      return cardId;

    return fallback;
  }

  static getCardSideTexture(num: number | null, fallback: string, scene: Phaser.Scene) {

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

    this.scene.leGame.table.cards.events.off("CardFrontChanged", this.cardChanged, this);
  }
}
