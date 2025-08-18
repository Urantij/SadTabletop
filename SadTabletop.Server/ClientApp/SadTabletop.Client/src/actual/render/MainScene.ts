import Phaser from "phaser";
import type LeGame from "../LeGame";
import type Card from "../things/concrete/Card";
import CardObject from "./objects/CardObject";
import type RenderObjectRepresentation from "@/actual/render/RenderObjectRepresentation.ts";
import { removeFromCollection } from "@/utilities/MyCollections.ts";
import type TableItem from "../things/TableItem";
import Animka from "./Animka";

export default class MainScene extends Phaser.Scene {

  leGame!: LeGame;

  readonly objects: RenderObjectRepresentation[] = [];

  readonly animka: Animka = new Animka(this);

  init(game: LeGame) {
    this.leGame = game;
  }

  preload() {
    console.log("preload");

    this.load.image("defaultBackSide", "back.png");
    this.load.image("defaultFrontSide", "front.png");

    for (const data of this.leGame.assetsData) {
      this.load.image(data.name, data.url);
    }
  }

  create() {
    // я понятия нахуй не имею что происходит
    // в старом проекте реди шло когда сцена была ГОТОВА
    // ща оно вылетает ДО ПРЕЛОАДА БЛЯТЬ
    this.events.emit("READY)))");
  }

  destroyEntity(obj: object) {
    const rended = removeFromCollection(this.objects, o => o.gameObject === obj);
    if (rended === undefined) {
      console.warn(`unknown obj ${obj}`);
      return;
    }

    rended.destroy();
  }

  moveItem(item: TableItem, oldX: number, oldY: number) {

    const obj = this.objects.find(o => o.gameObject.id === item.id);
    if (obj === undefined) {
      console.warn(`при муве такого нет ${item}`);
      return;
    }

    const xChange = item.x - oldX;
    const yChange = item.y - oldY;

    const targetPos = obj.getCurrentPosition().add({
      x: xChange,
      y: yChange
    });

    const speedPerUnit = 1.3;
    const distance = obj.getCurrentPosition().distance(targetPos);

    const time = distance / speedPerUnit;

    this.animka.moveObject(obj, targetPos.x, targetPos.y, time);
  }

  createCard(card: Card) {
    console.log(`создаём карту...`);
    const obj = CardObject.create(card, this);

    this.objects.push(obj);
  }
}
