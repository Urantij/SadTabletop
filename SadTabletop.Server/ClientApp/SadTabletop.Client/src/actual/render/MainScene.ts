import Phaser from "phaser";
import type LeGame from "../LeGame";
import type Card from "../things/concrete/Card";
import CardObject, { defaultBackSideKey, defaultFrontSidekey } from "./objects/CardObject";
import type RenderObjectRepresentation from "@/actual/render/RenderObjectRepresentation.ts";
import { removeFromCollection } from "@/utilities/MyCollections.ts";
import type TableItem from "../things/TableItem";
import Animka from "./Animka";
import type TextItem from "../things/concrete/TextItem";
import TextItemObject from "./objects/TextItemObject";
import type Deck from "@/actual/things/concrete/Decks/Deck";
import DeckObject, { deckSpotKey } from "./objects/DeckObject";

export default class MainScene extends Phaser.Scene {

  leGame!: LeGame;

  readonly objects: RenderObjectRepresentation[] = [];

  readonly animka: Animka = new Animka(this);

  init(game: LeGame) {
    this.leGame = game;
  }

  private preload() {
    console.log("preload");

    this.load.image(defaultBackSideKey, "back.png");
    this.load.image(defaultFrontSidekey, "front.png");

    this.load.image(deckSpotKey, "deckspot.png");

    for (const data of this.leGame.assetsData) {
      this.load.image(data.name, data.url);
    }
  }

  private create() {
    // я понятия нахуй не имею что происходит
    // в старом проекте реди шло когда сцена была ГОТОВА
    // ща оно вылетает ДО ПРЕЛОАДА БЛЯТЬ
    this.events.emit("READY)))");

    let holding = false;
    let position: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      holding = true;
      position = pointer.position;
    });
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (!holding)
        return;

      const distance = position.clone().subtract(pointer.position);

      const newX = this.cameras.main.scrollX + (distance.x / this.cameras.main.zoom);
      const newY = this.cameras.main.scrollY + (distance.y / this.cameras.main.zoom);

      this.cameras.main.setScroll(newX, newY);

      position = pointer.position.clone();
    });
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      holding = false;
    });
    this.input.on("wheel", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) => {

      if (deltaY === 0)
        return;

      // Чем ближе, тем медленнее идёт зум. нужно как то умнее скейлить TODO

      const change = deltaY > 0 ? -0.2 : 0.2;

      let newValue = this.cameras.main.zoom + (this.cameras.main.zoom * change);
      if (newValue <= 0.2) {
        newValue = 0.2;
      }
      else if (newValue >= 1.5) {
        newValue = 1.5;
      }

      this.cameras.main.zoomTo(newValue, 50);
    });
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

  flipCard(card: Card) {
    const obj = this.objects.find(o => o.gameObject.id === card.id) as CardObject;
    if (obj === undefined) {
      console.warn(`при flipCard такого нет ${card}`);
      return;
    }

    this.animka.flipCard(obj);
  }

  createText(textItem: TextItem) {
    const obj = TextItemObject.create(textItem, this);

    this.objects.push(obj);
  }

  createDeck(deck: Deck) {
    const obj = DeckObject.create(deck, this);

    this.objects.push(obj);
  }
}
