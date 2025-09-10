import Flipness from "@/actual/things/Flipness";
import type MainScene from "../MainScene";
import type Deck from "@/actual/things/concrete/Decks/Deck";
import CardObject, { cardHeight, cardWidth, defaultBackSideKey, defaultFrontSidekey } from "./CardObject";
import SimpleRenderObjectRepresentation from "../SimpleRenderObjectRepresentation";

export const deckSpotKey = "deckSpot";

export default class DeckObject extends SimpleRenderObjectRepresentation {

  declare readonly gameObject: Deck;
  declare readonly sprite: Phaser.GameObjects.Sprite;

  displayedSide: number | null;

  tooltip: Phaser.GameObjects.Text | null = null;

  constructor(gameObject: Deck, sprite: Phaser.GameObjects.Sprite, displayedSide: number | null) {
    super(gameObject, sprite, true);
    this.displayedSide = displayedSide;

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

  updateThingsPlease() {
    const newSide = this.gameObject.flipness === Flipness.Shown ? this.gameObject.frontSide : this.gameObject.backSide;

    if (newSide === this.displayedSide) {
      return;
    }

    const textureKey = DeckObject.getCurrentTextureKey(this.gameObject, this.sprite.scene as MainScene);

    this.sprite.setTexture(textureKey);

    this.displayedSide = newSide;
  }

  static create(deck: Deck, scene: MainScene) {

    const textureKey = DeckObject.getCurrentTextureKey(deck, scene);

    const texture = scene.textures.get(textureKey);

    const sprite = new Phaser.GameObjects.Sprite(scene, deck.x, deck.y, texture);
    sprite.setDisplaySize(cardWidth, cardHeight);
    scene.add.existing(sprite);

    const side = deck.flipness === Flipness.Shown ? deck.frontSide : deck.backSide;

    sprite.setInteractive();

    return new DeckObject(deck, sprite, side);
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
}
