import type LeGame from "../LeGame";
import Animka from "./Animka";
import CardRenderManager from "./CardRenderManager";

export default class BaseScene extends Phaser.Scene {
  leGame!: LeGame;

  readonly animka: Animka = new Animka(this);

  readonly cardRender: CardRenderManager = new CardRenderManager(this);

  init(game: LeGame) {
    this.leGame = game;
  }
}
