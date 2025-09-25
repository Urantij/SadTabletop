import type LeGame from "../LeGame";
import Animka from "./Animka";
import { defaultBackSideKey, defaultFrontSidekey } from "./objects/CardObject";
import SceneHand from "./SceneHand";

export default class HandScene extends Phaser.Scene {

  leGame!: LeGame;

  hand: SceneHand = null!;

  readonly animka: Animka = new Animka(this);

  init(game: LeGame) {
    this.leGame = game;
  }

  private preload() {
    console.log("preload");

    this.load.image(defaultBackSideKey, "back.png");
    this.load.image(defaultFrontSidekey, "front.png");

    for (const data of this.leGame.assetsData) {
      this.load.image(data.name, data.url);
    }
  }

  private create() {

    this.hand = SceneHand.create(this);

    // я понятия нахуй не имею что происходит
    // в старом проекте реди шло когда сцена была ГОТОВА
    // ща оно вылетает ДО ПРЕЛОАДА БЛЯТЬ
    this.events.emit("READY)))");
  }
}
