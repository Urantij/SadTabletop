import Flipness from "@/actual/things/Flipness";
import type MainScene from "../MainScene";
import type RenderObjectRepresentation from "../RenderObjectRepresentation";
import type Deck from "@/actual/things/concrete/Deck";
import CardObject, { cardHeight, cardWidth, defaultBackSideKey, defaultFrontSidekey } from "./CardObject";

export const deckSpotKey = "deckSpot";

export default class DeckObject implements RenderObjectRepresentation {

  gameObject: Deck;

  sprite: Phaser.GameObjects.Sprite;

  tooltip: Phaser.GameObjects.Text | null = null;

  constructor(gameObject: Deck, sprite: Phaser.GameObjects.Sprite) {
    this.gameObject = gameObject;
    this.sprite = sprite;

    this.sprite.on("pointerover", (poiner: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
      this.tooltip = sprite.scene.add.text(sprite.x + cardWidth, sprite.y, `${gameObject.cardsCount}`);
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

  static create(deck: Deck, scene: MainScene) {

    const textureKey = DeckObject.getCurrentTextureKey(deck, scene);

    const texture = scene.textures.get(textureKey);

    const sprite = new Phaser.GameObjects.Sprite(scene, deck.x, deck.y, texture);
    sprite.setDisplaySize(cardWidth, cardHeight);
    scene.add.existing(sprite);

    sprite.setInteractive();

    return new DeckObject(deck, sprite);
  }

  static getCurrentTextureKey(obj: Deck, scene: MainScene) {

    if (obj.cardsCount === 0) {
      return deckSpotKey;
    }

    if (obj.flipness === Flipness.Shown) {
      return CardObject.getCardSideTextureKey(obj.frontSide, defaultFrontSidekey, scene);
    }

    return CardObject.getCardSideTextureKey(obj.backSide, defaultBackSideKey, scene);
  }

  getCurrentPosition(): Phaser.Math.Vector2 {
    return this.sprite.getWorldPoint();
  }
  changePosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
  }
  destroy(): void {
    this.sprite.destroy();
  }
}
