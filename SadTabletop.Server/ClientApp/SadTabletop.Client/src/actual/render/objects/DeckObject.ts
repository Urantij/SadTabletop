import type MainScene from "../MainScene";
import type Deck from "@/actual/things/concrete/Decks/Deck";
import CardObject from "./CardObject";
import SimpleRenderObjectRepresentation from "../SimpleRenderObjectRepresentation";
import CardRenderManager from "../CardRenderManager";
import type BaseScene from "../BaseScene";
import type CardFaceComplicated from "@/actual/things/concrete/Cards/CardFaceComplicated";
import { sameCardFace2 } from "@/actual/things/concrete/Cards/CardCompareHelper";

export const deckSpotKey = "deckSpot";

export default class DeckObject extends SimpleRenderObjectRepresentation<Deck, Phaser.GameObjects.Sprite> {

  displayedFace: CardFaceComplicated | null;

  tooltip: Phaser.GameObjects.Text | null = null;

  constructor(gameObject: Deck, sprite: Phaser.GameObjects.Sprite, displayedFace: CardFaceComplicated | null) {
    super(gameObject, sprite, true);
    this.displayedFace = structuredClone(displayedFace);

    this.sprite.on("pointerover", (poiner: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
      this.tooltip = sprite.scene.add.text(sprite.x + sprite.displayWidth, sprite.y, `${gameObject.cardsCount}`);
      this.tooltip.depth = sprite.depth + 1;
    });
    this.sprite.on("pointerout", (poiner: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
      if (this.tooltip === null) {
        return;
      }

      this.tooltip.destroy();
      this.tooltip = null;
    });
  }

  updateThingsPlease() {

    if (sameCardFace2(this.displayedFace, this.gameObject.side))
      return;

    const texture = DeckObject.getTexture(this.gameObject, this.sprite.scene as MainScene);

    if (CardRenderManager.isCustomCardId(this.sprite.texture.key)) {
      (this.sprite.scene as BaseScene).cardRender.freeCardTexture(this.sprite.texture.key);
    }

    this.sprite.setTexture(texture.key);

    this.displayedFace = structuredClone(this.gameObject.side);
  }

  static create(deck: Deck, scene: MainScene, width: number, height: number) {

    const texture = DeckObject.getTexture(deck, scene);

    const sprite = new Phaser.GameObjects.Sprite(scene, deck.x, deck.y, texture);
    sprite.setDisplaySize(width, height);
    scene.add.existing(sprite);

    sprite.setInteractive();

    return new DeckObject(deck, sprite, deck.side);
  }

  static getTexture(obj: Deck, scene: MainScene) {

    if (obj.cardsCount === 0) {
      return scene.textures.get(deckSpotKey);
    }

    return CardObject.getCardSideTexture(obj.side, deckSpotKey, scene);
  }

  override destroy(): void {
    if (CardRenderManager.isCustomCardId(this.sprite.texture.key)) {
      (this.sprite.scene as BaseScene).cardRender.freeCardTexture(this.sprite.texture.key);
    }

    super.destroy();
  }
}
