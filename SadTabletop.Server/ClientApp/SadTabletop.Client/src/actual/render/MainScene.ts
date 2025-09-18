import Phaser from "phaser";
import type LeGame from "../LeGame";
import CardObject, { defaultBackSideKey, defaultFrontSidekey } from "./objects/CardObject";
import type RenderObjectRepresentation from "@/actual/render/RenderObjectRepresentation.ts";
import { removeFromCollection } from "@/utilities/MyCollections.ts";
import type TableItem from "../things/TableItem";
import Animka from "./Animka";
import type TextItem from "../things/concrete/TextItem";
import TextItemObject from "./objects/TextItemObject";
import type Deck from "@/actual/things/concrete/Decks/Deck";
import DeckObject, { deckSpotKey } from "./objects/DeckObject";
import type Card from "../things/concrete/Cards/Card";
import DeckCardRemovedData from "../things/concrete/Decks/DeckCardRemovedData";
import { ContainerObjectDataKey } from "./SimpleRenderObjectRepresentation";
import type RectShape from "../things/concrete/Shapes/RectShape";
import RectShapeObject from "./objects/RectShapeObject";
import SceneHand from "./SceneHand";

export default class MainScene extends Phaser.Scene {

  leGame!: LeGame;

  readonly objects: RenderObjectRepresentation[] = [];

  readonly animka: Animka = new Animka(this);

  hand: SceneHand = null!;

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

    this.hand = SceneHand.create(this);

    // я понятия нахуй не имею что происходит
    // в старом проекте реди шло когда сцена была ГОТОВА
    // ща оно вылетает ДО ПРЕЛОАДА БЛЯТЬ
    this.events.emit("READY)))");

    // кликаем по хуйне. надо бы вынести отсюда TODO
    {
      const clicked: RenderObjectRepresentation[] = [];
      let clickDate = this.time.now;

      this.input.on("pointerdown", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {

        clickDate = this.time.now;

        clicked.splice(0);

        for (const element of currentlyOver) {
          const container = element.getData(ContainerObjectDataKey) as RenderObjectRepresentation | undefined;
          if (container === undefined) {
            continue;
          }
          if (!container.clicky) {
            continue;
          }

          clicked.push(container);
        }
      });
      this.input.on("pointerup", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
        if (this.time.now - clickDate > 150) {
          return;
        }

        const wereClicked = clicked.splice(0).filter(container => container.clicky);

        if (wereClicked.length !== 1) {
          return;
        }

        this.events.emit("ClickyClicked", wereClicked[0]);
      });
    }

    // мувемент. надо бы вынести нахуй отсюда TODO
    {
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
  }

  // override update(time: number, delta: number): void {
  //   super.update(time, delta);

  //   // я поспрашивал людей, трое сказали, что объект сам должен себя двигать
  //   // я офк сделал по своему, но осадочек остался
  //   for (const obj of this.objects) {
  //     const current = obj.getCurrentPosition();

  //     if (current.equals(obj.targetPosition))
  //       continue;

  //     const difference = obj.targetPosition.clone().subtract(current);
  //     const change = difference.normalize();
  //     change.x *= obj.speed * delta;
  //     change.y *= obj.speed * delta;

  //     const newPosition = current.clone().add(change);

  //     // TODO как это сделать нормально?
  //     if (difference.x < 0) {
  //       if (newPosition.x < obj.targetPosition.x) {
  //         newPosition.x = obj.targetPosition.x;
  //       }
  //     }
  //     else {
  //       if (newPosition.x > obj.targetPosition.x) {
  //         newPosition.x = obj.targetPosition.x;
  //       }
  //     }
  //     if (difference.y < 0) {
  //       if (newPosition.y < obj.targetPosition.y) {
  //         newPosition.y = obj.targetPosition.y;
  //       }
  //     }
  //     else {
  //       if (newPosition.y > obj.targetPosition.y) {
  //         newPosition.y = obj.targetPosition.y;
  //       }
  //     }

  //     obj.changePosition2(newPosition.x, newPosition.y);
  //   }
  // }

  destroyEntity(obj: object) {
    const rended = removeFromCollection(this.objects, o => o.gameObject === obj);
    if (rended === undefined) {
      console.warn(`unknown obj ${obj}`);
      return;
    }

    rended.destroy();
  }

  clearItems() {
    for (const obj of this.objects) {
      obj.destroy();
    }
    this.objects.splice(0);
  }

  moveItem(item: TableItem, oldX: number, oldY: number) {

    const obj = this.objects.find(o => o.gameObject.id === item.id);
    if (obj === undefined) {
      console.warn(`при муве такого нет ${item}`);
      return;
    }

    // const xChange = item.x - oldX;
    // const yChange = item.y - oldY;

    // const targetPos = obj.getCurrentPosition().add({
    //   x: xChange,
    //   y: yChange
    // });

    const targetPos = new Phaser.Math.Vector2(item.x, item.y);

    this.animka.moveObject2(obj, targetPos.x, targetPos.y);
  }

  createCard(card: Card, data: object | null) {
    console.log(`создаём карту...`);

    if (data instanceof DeckCardRemovedData) {

      const deckObj = this.objects.find(o => o.gameObject.id === data.deck.id);
      if (deckObj === undefined) {
        console.warn(`createCard deckObj === undefined`);
        return;
      }

      const deckPos = deckObj.getCurrentPosition();

      const obj = CardObject.create(card, this, deckPos.x, deckPos.y);
      this.objects.push(obj);

      // тупо
      this.moveItem(card, deckPos.x, deckPos.y);
    }
    else {
      const obj = CardObject.create(card, this);
      this.objects.push(obj);
    }
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

  createRectShape(shape: RectShape) {
    const obj = RectShapeObject.create(shape, this);
    this.objects.push(obj);
  }

  createDeck(deck: Deck) {
    const obj = DeckObject.create(deck, this);

    this.objects.push(obj);
  }

  updateDeck(deck: Deck) {
    const obj = this.objects.find(o => o.gameObject.id === deck.id) as DeckObject;
    if (obj === undefined) {
      console.warn(`при updateDeck такого нет ${deck}`);
      return;
    }

    obj.updateThingsPlease();
  }

  insertCardToDeck(deck: Deck, card: Card) {
    const deckObj = this.objects.find(o => o.gameObject.id === deck.id) as DeckObject;
    if (deckObj === undefined) {
      console.warn(`при insertCardToDeck такого нет deck ${deck}`);
      return;
    }

    const cardObj = this.objects.find(o => o.gameObject.id === card.id) as CardObject;
    if (cardObj === undefined) {
      console.warn(`при insertCardToDeck такого нет card ${card}`);
      return;
    }

    this.animka.moveObjectToObject(cardObj, deckObj, () => {
      cardObj.destroy();
      deckObj.updateThingsPlease();
    });
  }

  removeCardFromDeck(deck: Deck, card: Card) {
    const deckObj = this.objects.find(o => o.gameObject.id === deck.id) as DeckObject;
    if (deckObj === undefined) {
      console.warn(`при insertCardToDeck такого нет deck ${deck}`);
      return;
    }

    deckObj.updateThingsPlease();
  }

  updateClicky(item: TableItem, clicky: boolean) {
    const obj = this.objects.find(o => o.gameObject.id === item.id);
    if (obj === undefined) {
      console.warn(`при updateClicky такого нет card ${item}`);
      return;
    }

    obj.updateClicky(clicky);
  }
}
