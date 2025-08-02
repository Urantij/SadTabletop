import Phaser from "phaser";
import SidesCollection from "./SidesCollection";
import type LeGame from "../LeGame";
import type Card from "../things/concrete/Card";
import CardObject from "./objects/CardObject";

export default class MainScene extends Phaser.Scene {

    leGame!: LeGame;

    public readonly sides: SidesCollection = new SidesCollection("defaultBackSide", "defaultFrontSide");

    readonly objects: object[] = [];

    init(game: LeGame) {
        this.leGame = game;
    }

    preload() {
        console.log("preload");

        this.load.image("defaultBackSide", "back.png");
        this.load.image("defaultFrontSide", "front.png");

        for (const data of this.leGame.sidesData) {
            const textureName = `card${data.num}`;
            this.load.image(textureName, data.path);
            this.sides.addSide(data.num, textureName);
        }
    }

    create() {
        // я понятия нахуй не имею что происходит
        // в старом проекте реди шло когда сцена была ГОТОВА
        // ща оно вылетает ДО ПРЕЛОАДА БЛЯТЬ
        this.events.emit("READY)))");
    }

    createCard(card: Card) {
        console.log(`создаём карту...`);
        const obj = CardObject.create(card, this);

        this.objects.push(obj);
    }
}