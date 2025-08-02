import type Card from "@/actual/things/concrete/Card";
import type MainScene from "../MainScene";
import Flipness from "@/actual/things/Flipness";

const width = 250;
const height = 350;

export default class CardObject {

    readonly card: Card;

    readonly scene: MainScene;

    readonly sprite: Phaser.GameObjects.Sprite;

    constructor(card: Card, scene: MainScene, sprite: Phaser.GameObjects.Sprite) {
        this.card = card;
        this.scene = scene;
        this.sprite = sprite;
    }

    public static create(card: Card, scene: MainScene) {

        const sideTextureId = card.flipness === Flipness.Shown ? scene.sides.getFrontSide(card.frontSide)
            : scene.sides.getBackSide(card.backSide);

        const texture = scene.textures.get(sideTextureId);

        const cardSprite = new Phaser.GameObjects.Sprite(scene, card.x, card.y, texture);
        cardSprite.setDisplaySize(width, height);
        scene.add.existing(cardSprite);

        const obj = new CardObject(card, scene, cardSprite);

        return obj;
    }
}