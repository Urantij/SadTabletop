import type LeGame from "../LeGame";
import Animka from "./Animka";

export default class BaseScene extends Phaser.Scene {
  leGame!: LeGame;

  readonly animka: Animka = new Animka(this);

  init(game: LeGame) {
    this.leGame = game;
  }
}
