import type TypedEmitter from "@/utilities/TypedEmiiter";
import Phaser from "phaser";
import CardObject, { defaultBackSideKey, defaultFrontSidekey } from "./objects/CardObject";
import type RenderObjectRepresentation from "@/actual/render/RenderObjectRepresentation.ts";
import { removeFromCollection } from "@/utilities/MyCollections.ts";
import type TextItem from "../things/concrete/TextItem";
import TextItemObject from "./objects/TextItemObject";
import type Deck from "@/actual/things/concrete/Decks/Deck";
import DeckObject, { deckSpotKey } from "./objects/DeckObject";
import type Card from "../things/concrete/Cards/Card";
import DeckCardRemovedData from "../things/concrete/Decks/DeckCardRemovedData";
import { ContainerObjectDataKey } from "./SimpleRenderObjectRepresentation";
import type RectShape from "../things/concrete/Shapes/RectShape";
import RectShapeObject from "./objects/RectShapeObject";
import type CircleShape from "../things/concrete/Shapes/CircleShape";
import CircleShapeObject from "./objects/CircleShapeObject";
import CursorObject, { cursorTextureKey } from "./objects/CursorObject";
import type Player from "../things/Player";
import HandScene, { cardDragEndedName, cardDragName, cardDragStartedName, cardPlayedOnName, pointerOverHoveredName } from "./HandScene";
import BaseScene from "./BaseScene";
import SceneHand from "./SceneHand";
import type Hand from "../things/concrete/Hands/Hand";
import { findComponent } from "@/utilities/Componenter";
import type HandOverrideComponent from "../things/concrete/Hands/HandOverrideComponent";
import GameValues from "../GameValues";
import type Entity from "../things/Entity";
import Sizes from "./Sizes";
import Control from "./Control";
import SelectionGlowManager from "./SelectionGlowManager";
import type ClickComponent from "../things/concrete/Clicks/ClickComponent";
import type MySprite from "../things/concrete/Sprites/MySprite";
import MySpriteObject from "./objects/MySpriteObject";
import type MyTileSprite from "../things/concrete/Sprites/MyTileSprite";
import MyTileSpriteObject from "./objects/MyTileSpriteObject";
import type CameraBoundSetting from "../things/concrete/Settings/Variants/CameraBoundSetting";
import type TableItem from "../things/concrete/Table/TableItem";
import type DeckCardInsertedData from "../things/concrete/Decks/DeckCardInsertedData";
import DiceObject, { defaultDiceTextureKey } from "./objects/DiceObject";
import type Dice from "../things/concrete/Dices/Dice";

type MainSceneEvents = {
  ObjectCreated: (obj: RenderObjectRepresentation) => void;
  DescriptionRequired: (obj: RenderObjectRepresentation) => void;
  DescriptionNotNeeded: (obj: RenderObjectRepresentation) => void;
  DeckRightClicked: (pointer: Phaser.Input.Pointer, obj: DeckObject) => void;
}

// TODO не тут
export function makeCardTextureId(num: number) {
  return `card${num}`;
}
export function makeTextureId(assetId: number) {
  return `_assetid${assetId}`;
}

export const cursorMovedInTheWorldName = "CursorMovedInTheWorld";

interface DragHolder {
  item: RenderObjectRepresentation;
  cursor: CursorObject;
}

export default class MainScene extends BaseScene {

  hander!: HandScene;

  readonly objects: RenderObjectRepresentation[] = [];

  readonly hands: SceneHand[] = [];

  readonly drags: DragHolder[] = [];

  readonly glowManager: SelectionGlowManager = new SelectionGlowManager();

  public readonly myEvents: TypedEmitter<MainSceneEvents> = new Phaser.Events.EventEmitter();

  fkey: Phaser.Input.Keyboard.Key | undefined;

  private getHand(hand: Hand) {
    let obj = this.hands.find(h => h.hand === hand);

    if (obj === undefined) {

      const seatIndex = this.leGame.bench.entities.indexOf(hand.owner);

      // я не буду обрабатывать -1

      const handOverride = findComponent<HandOverrideComponent>(hand.owner, "HandOverrideComponent");

      const handStartX = handOverride?.x ?? GameValues.HandsArrayStartX + seatIndex * (GameValues.HandsArrayWidth + GameValues.HandsArrayDistance);
      const handStartY = handOverride?.y ?? GameValues.HandsArrayStartY

      obj = SceneHand.create(this, hand, handStartX, handStartY, GameValues.HandsArrayWidth, handOverride?.rotation ?? 0, Sizes.cardWidth, 0);
      this.hands.push(obj);
    }

    return obj;
  }

  private preload() {
    console.log("preload");

    this.textures.generate(defaultDiceTextureKey, {
      data: ['1'],
      pixelWidth: 1,
      pixelHeight: 1
    })

    this.load.image(defaultBackSideKey, "back.png");
    this.load.image(defaultFrontSidekey, "front.png");
    this.load.image(cursorTextureKey, "cursor.png");

    this.load.image(deckSpotKey, "deckspot.png");

    for (const data of this.leGame.assetsData) {
      this.load.image(data.name, data.url);
      // TODO разобраться ок или нет
      this.load.image(makeTextureId(data.id), data.url);
    }
  }

  private create() {

    // я понятия нахуй не имею что происходит
    // в старом проекте реди шло когда сцена была ГОТОВА
    // ща оно вылетает ДО ПРЕЛОАДА БЛЯТЬ
    // this.events.emit("READY)))");

    if (this.input.keyboard !== null) {
      this.fkey = this.input.keyboard.addKey(Control.flipKey);

      Control.events.on("HandsFocus", (taken) => {
        this.input.keyboard!.enabled = !taken;
      });
    }

    this.hander = this.scene.add("Hand", HandScene, false) as HandScene;
    this.hander.events.once("READY)))", () => {
      this.events.emit("READY)))");
    });

    // даже не знаю, нахуй или нет
    {
      const cameraBound = this.leGame.settings.findSetting<CameraBoundSetting>("CameraBoundSetting");
      setBounds(this, cameraBound);
      this.leGame.settings.events.on("CameraBoundChanged", (setting) => {
        setBounds(this, setting);
      });

      function setBounds(scene: MainScene, setting: CameraBoundSetting | undefined) {
        if (setting === undefined) {
          scene.cameras.main.removeBounds();
          console.log("Убираем баунды");
        }
        else {
          scene.cameras.main.setBounds(setting.x, setting.y, setting.width, setting.height);
          console.log("Ставим баунды");
        }
      }
    }

    // как всегда, нахуй отсюда TODO
    {
      this.leGame.drags.events.on("DragStarted", (player, item) => {
        const cursor = this.objects.find(o => o instanceof CursorObject && o.player === player) as CursorObject | undefined;

        if (cursor === undefined) {
          console.warn(`DragStarted no palyer ${player.id}`);
          return;
        }

        const obj = this.objects.find(o => o.gameObject === item);

        if (obj === undefined) {
          console.warn(`DragStarted no item ${player.id} ${item.id}`);
          return;
        }

        this.drags.push({
          cursor: cursor,
          item: obj
        });
        this.animka.moveObjectToObject(obj, cursor);
      });
      this.leGame.drags.events.on("DragEnded", (player, item) => {
        const drag = removeFromCollection(this.drags, d => d.cursor.player === player);

        if (drag === undefined) {
          console.warn(`DragEnded не нашёлс ${player.id} ${item.id}`);
          return;
        }

        this.animka.moveObject2(drag.item, drag.item.gameObject.x, drag.item.gameObject.y);
      });
      this.leGame.events.on("Clearing", () => {
        this.drags.splice(0);
      });
      this.myEvents.on("ObjectCreated", (obj) => {
        const dragged = this.leGame.drags.draggedItems.find(d => d.item === obj.gameObject);

        if (dragged === undefined)
          return;

        const cursor = this.objects.find(o => o instanceof CursorObject && o.player === dragged.player) as CursorObject | undefined;

        if (cursor === undefined) {
          console.warn(`ObjectCreated no palyer ${dragged.player.id}`);
          return;
        }

        this.drags.push({
          cursor: cursor,
          item: obj
        });
        this.animka.moveObjectToObject(obj, cursor);
      });

      // не тут?
      this.leGame.playersContainer.events.on("CursorMoved", (player) => {
        const cursor = this.objects.find(o => o instanceof CursorObject && o.player === player) as CursorObject | undefined;

        if (cursor === undefined) {
          console.warn(`CursorMoved no cursor ${player.id}`);
          return;
        }

        this.animka.moveObject2(cursor, player.cursor.x, player.cursor.y);

        // как то засплитать надо.

        const drag = this.drags.find(d => d.cursor === cursor);
        if (drag !== undefined) {
          this.animka.moveObject2(drag.item, player.cursor.x, player.cursor.y);
        }
      });
    }

    // по классике, нахуй отсюда TODO
    {
      this.leGame.hands.events.on("CardMovedToHand", (card, component) => {
        const obj = this.objects.find(o => o.gameObject === card) as CardObject | undefined;
        if (obj === undefined) {
          console.warn(`нет обекта CardMovedToHand ${card.id}`);
          return;
        }

        obj.inhand = component;

        const hand = this.getHand(component.hand);

        hand.addCardToHand(obj, true);
      });
      this.leGame.hands.events.on("CardRemovedFromHand", (card, hand) => {
        const obj = this.objects.find(o => o.gameObject === card) as CardObject | undefined;
        if (obj === undefined) {
          console.warn(`нет обекта CardRemovedFromHand ${card.id}`);
          return;
        }

        obj.inhand = null;

        const sceneHand = this.getHand(hand);

        sceneHand.removeCardFromHand(obj);
      });
    }

    // кликаем по хуйне. надо бы вынести отсюда TODO
    let heldObject: RenderObjectRepresentation | null = null;
    {
      const clickedClicky: RenderObjectRepresentation[] = [];
      const clickedDraggy: RenderObjectRepresentation[] = [];
      let clickDate = this.time.now;

      let clickTimeoutNum: number | undefined = undefined;

      this.input.on("pointerdown", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {

        clickDate = this.time.now;

        clickedClicky.splice(0);
        clickedDraggy.splice(0);

        for (const element of currentlyOver) {
          const container = element.getData(ContainerObjectDataKey) as RenderObjectRepresentation | undefined;
          if (container === undefined) {
            continue;
          }
          if (container.clicky) {
            clickedClicky.push(container);
          }
          if (container.isDraggable()) {
            clickedDraggy.push(container);
          }
        }

        // if (clickedDraggy.length === 1) {
        //   clickTimeoutNum = setTimeout(() => {
        //     const obj = clickedDraggy.splice(0)[0];

        //     if (!obj.isDraggable())
        //       return;

        //     const pos = pointer.positionToCamera(this.hand.handCamera) as Phaser.Math.Vector2;;

        //     heldObject = obj;
        //     this.animka.moveObject2(heldObject, pos.x, pos.y);
        //   }, 50);
        // }
      });
      this.input.on("pointerup", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {

        if (heldObject !== null) {
          heldObject = null;
          return;
        }

        if (this.time.now - clickDate > 150) {
          return;
        }

        clearTimeout(clickTimeoutNum);

        if (pointer.rightButtonReleased()) {
          // Я НЕ ЗНАЮ КАК, НО ЭТО МАССИВ С ДЛИНОЙ 0 В КОТОРОМ ЕСТЬ ЭЛЕМЕНТЫ.
          let counter = 0;
          for (const _ of currentlyOver) {
            counter++;
          }

          if (counter !== 1)
            return;

          const target = currentlyOver[0];

          const container = target.getData(ContainerObjectDataKey) as RenderObjectRepresentation | undefined;
          if (container === undefined) {
            return;
          }

          if (container instanceof DeckObject) {
            this.myEvents.emit("DeckRightClicked", pointer, container);
          }
          return;
        }

        const wereClicked = clickedClicky.splice(0).filter(container => container.clicky);

        if (wereClicked.length !== 1) {
          return;
        }

        this.events.emit("ClickyClicked", wereClicked[0]);
      });
      // this.input.on("pointermove", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      //   if (heldObject === null)
      //     return;

      //   const pos = pointer.positionToCamera(this.hand.handCamera) as Phaser.Math.Vector2;;

      //   this.animka.moveObject2(heldObject, pos.x, pos.y);
      //   // heldObject.followPoint = pointer.positionToCamera(this.hand.handCamera) as Phaser.Math.Vector2;
      // });
    }

    // мувемент. надо бы вынести нахуй отсюда TODO
    {
      let holding = false;
      let position: Phaser.Math.Vector2 = Phaser.Math.Vector2.ZERO;
      this.input.on("pointerdown", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
        holding = true;
        position = pointer.position;

        this.hander.input.enabled = false;
      });
      this.input.on("pointermove", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
        // console.log(`main move ${currentlyOver.length}`);
        if (!holding || heldObject !== null)
          return;

        const distance = position.clone().subtract(pointer.position);

        const newX = this.cameras.main.scrollX + (distance.x / this.cameras.main.zoom);
        const newY = this.cameras.main.scrollY + (distance.y / this.cameras.main.zoom);

        this.cameras.main.setScroll(newX, newY);

        position = pointer.position.clone();
      });
      this.input.on("pointerup", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
        holding = false;
        this.hander.input.enabled = true;
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

    // Курсор. Вынести бы нахуй отсюда TODO
    {
      this.input.on("pointermove", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {

        // if (this.hander.hoveredObject !== null && this.hander.relativePointerPosition !== null) {

        //   const cardObj = this.objects.find(o => o.gameObject === this.hander.hoveredObject?.gameObject && o instanceof CardObject) as CardObject | undefined;

        //   if (cardObj !== undefined) {
        //     const pos = cardObj.getCurrentPosition().clone();

        //     pos.x += cardObj.sprite.displayWidth * this.hander.relativePointerPosition.x;
        //     pos.y += cardObj.sprite.displayHeight * this.hander.relativePointerPosition.y;

        //     this.events.emit(cursorMovedInTheWorldName, pos);
        //     return;
        //   }
        // }

        const pos = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

        // pos.x /= this.cameras.main.zoom;
        // pos.y /= this.cameras.main.zoom;

        this.events.emit(cursorMovedInTheWorldName, pos);
      });

      this.hander.events.on(pointerOverHoveredName, (hoveredObj: CardObject, relative: Phaser.Math.Vector2) => {
        const cardObj = this.objects.find(o => o.gameObject === hoveredObj.gameObject && o instanceof CardObject) as CardObject | undefined;

        if (cardObj === undefined) {
          console.warn(`карты нет ${pointerOverHoveredName} ${hoveredObj.gameObject.id}`);
          return;
        }

        if (this.hander.dragObj !== null) {
          const hand = this.hands.find(h => h.hand?.owner === this.leGame.ourPlayer?.seat);

          if (hand === undefined) {
            console.warn(`${pointerOverHoveredName} hand не нашлась`);
            return;
          }

          // в хенд сцене у карт ориджин 0.5 1
          // тут 0.5 0.5
          relative.y += 0.5;

          let pos = hand.getCardHandBasePosition(cardObj.inhand?.index ?? 0);

          pos.x += cardObj.sprite.displayWidth * relative.x;
          pos.y += cardObj.sprite.displayHeight * relative.y;

          if (hand.radians !== 0)
            pos = GameValues.rotatePosition(pos, hand.radians);

          pos.x += hand.handPositionX;
          pos.y += hand.handPositionY;

          this.events.emit(cursorMovedInTheWorldName, pos);
        }
        else {
          const pos = cardObj.getCurrentPosition().clone();

          pos.x += cardObj.sprite.displayWidth * relative.x;
          pos.y += cardObj.sprite.displayHeight * relative.y;

          this.events.emit(cursorMovedInTheWorldName, pos);
        }
      });
    }

    // Обработка юзаний карты из рук
    {
      this.leGame.table.clicks.events.on("ItemClickyChanged", (item, isClicky) => {
        // TODO я каждый раз ищу. Моооожет быть как то всё таки стоило связать их?
        const obj = this.objects.find(o => o.gameObject === item);

        if (obj === undefined)
          return;

        if (isClicky)
          this.glowManager.addClicky(obj);
        else
          this.glowManager.removeClicky(obj);
      });
      this.myEvents.on("ObjectCreated", obj => {
        const clicky = findComponent<ClickComponent>(obj.gameObject, "ClickComponent");
        if (clicky === undefined)
          return;

        this.glowManager.addClicky(obj);
      });
      this.leGame.table.events.on("EntityRemoved", (item) => {
        const obj = this.objects.find(o => o.gameObject === item);
        if (obj === undefined)
          return;

        this.glowManager.removeObject(obj);
      });
      this.leGame.events.on("Clearing", () => {
        this.glowManager.clear();
      });
      this.hander.events.on(cardDragStartedName, (cardObj: CardObject) => {
        if (cardObj.playable?.targets == null)
          return;

        const targets: RenderObjectRepresentation[] = [];
        for (const element of cardObj.playable.targets) {

          const targetObj = this.objects.find(o => o.gameObject === element);
          if (targetObj === undefined) {
            console.warn(`${cardDragStartedName} не удалось найти объект-таргет ${element.type}:${element.id}`);
            continue;
          }

          targets.push(targetObj);
        }

        this.glowManager.cardDragStarted(targets);
      });
      this.hander.events.on(cardDragName, (cardObj: CardObject) => {
        if (!this.glowManager.drag)
          return;

        const point = this.cameras.main.getWorldPoint(this.input.activePointer.x, this.input.activePointer.y);

        this.glowManager.cardDragMoved(point.x, point.y);
      });
      this.hander.events.on(cardDragEndedName, (cardObj: CardObject) => {
        if (!this.glowManager.drag)
          return;

        this.glowManager.cardDragEnded();
      });

      this.hander.events.on(cardPlayedOnName, (cardObj: CardObject, screenX: number, screenY: number) => {

        if (cardObj.playable === null) {
          console.warn(`не плейбл в плей кард он`);
          return;
        }
        if (cardObj.playable.targets === null) {
          console.warn(`плейбл без таргетов в плей кард он`);
          return;
        }

        let ourBoy: RenderObjectRepresentation | undefined = undefined;
        for (const element of cardObj.playable.targets) {

          const targetObj = this.objects.find(o => o.gameObject === element);
          if (targetObj === undefined) {
            console.warn(`${cardPlayedOnName} не удалось найти объект-таргет ${element.type}:${element.id}`);
            continue;
          }

          const point = this.cameras.main.getWorldPoint(this.input.activePointer.x, this.input.activePointer.y);
          const inside = targetObj.positionTest(point.x, point.y);
          // this.input.activePointer.updateWorldPoint(this.cameras.main);
          // const inside = targetObj.positionTest(this.input.activePointer.worldX, this.input.activePointer.worldY);

          if (!inside)
            continue;

          if (ourBoy === undefined) {
            ourBoy = targetObj;
          }
          else {
            ourBoy = undefined;
            break;
          }
        }

        // const hitTested = this.input.hitTestPointer(this.input.activePointer);
        // let ourBoy: TableItem | undefined = undefined;
        // for (const element of hitTested) {
        //   const container = element.getData(ContainerObjectDataKey) as RenderObjectRepresentation | undefined;

        //   if (container === undefined)
        //     continue;

        //   if (cardObj.playable.targets.includes(container.gameObject)) {

        //     if (ourBoy === undefined) {
        //       ourBoy = container.gameObject;
        //     }
        //     else {
        //       ourBoy = undefined;
        //       break;
        //     }
        //   }
        // }

        if (ourBoy === undefined) {
          return;
        }

        this.leGame.playable.play(cardObj.gameObject, ourBoy.gameObject);
      });
    }

    {
      let currentDescriptionObject: RenderObjectRepresentation | null = null;

      this.input.on("pointermove", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {

        const targets = currentlyOver.map(co => co.getData(ContainerObjectDataKey) as RenderObjectRepresentation | undefined)
          .filter(co => co !== undefined && co.gameObject.description !== null);

        if (currentDescriptionObject !== null) {
          if (targets.includes(currentDescriptionObject))
            return;

          this.myEvents.emit("DescriptionNotNeeded", currentDescriptionObject);
          currentDescriptionObject = null;
        }

        if (targets.length !== 1)
          return;

        currentDescriptionObject = targets[0] as RenderObjectRepresentation;

        this.myEvents.emit("DescriptionRequired", currentDescriptionObject);
      });
    }
    // Таймер описаний
    // это если выводить на экране после задержки. пока передумау так делать (впадлу)
    // {
    //   const timerWaitTime = 200;
    //   let currentTimer: number | null = null;
    //   let currentDescriptionObject: RenderObjectRepresentation | null = null;

    //   this.input.on("pointermove", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {

    //     if (currentTimer !== null) {
    //       clearTimeout(currentTimer);
    //     }

    //     if (currentDescriptionObject !== null) {
    //       this.myEvents.emit("DescriptionNotNeeded", currentDescriptionObject);
    //       currentDescriptionObject = null;
    //     }

    //     currentTimer = setTimeout(() => {

    //       const targets = currentlyOver.map(co => co.getData(ContainerObjectDataKey) as RenderObjectRepresentation | undefined)
    //         .filter(co => co !== undefined && co.gameObject.description !== null);

    //       if (targets.length !== 1)
    //         return;

    //       currentDescriptionObject = targets[0] as RenderObjectRepresentation;

    //       this.myEvents.emit("DescriptionRequired", currentDescriptionObject);
    //     }, timerWaitTime);
    //   });
    // }

    this.scene.launch(this.hander, this.leGame);
  }

  override update(time: number, delta: number): void {
    super.update(time, delta);

    // // я поспрашивал людей, трое сказали, что объект сам должен себя двигать
    // // я офк сделал по своему, но осадочек остался
    // for (const obj of this.objects) {
    //   const current = obj.getCurrentPosition();

    //   if (current.equals(obj.targetPosition))
    //     continue;

    //   const difference = obj.targetPosition.clone().subtract(current);
    //   const change = difference.normalize();
    //   change.x *= obj.speed * delta;
    //   change.y *= obj.speed * delta;

    //   const newPosition = current.clone().add(change);

    //   // TODO как это сделать нормально?
    //   if (difference.x < 0) {
    //     if (newPosition.x < obj.targetPosition.x) {
    //       newPosition.x = obj.targetPosition.x;
    //     }
    //   }
    //   else {
    //     if (newPosition.x > obj.targetPosition.x) {
    //       newPosition.x = obj.targetPosition.x;
    //     }
    //   }
    //   if (difference.y < 0) {
    //     if (newPosition.y < obj.targetPosition.y) {
    //       newPosition.y = obj.targetPosition.y;
    //     }
    //   }
    //   else {
    //     if (newPosition.y > obj.targetPosition.y) {
    //       newPosition.y = obj.targetPosition.y;
    //     }
    //   }

    //   obj.changePosition2(newPosition.x, newPosition.y);
    // }
  }

  destroyEntity(obj: Entity) {
    const rended = removeFromCollection(this.objects, o => o.gameObject === obj);
    if (rended === undefined) {
      console.warn(`unknown obj ${obj}`);
      return;
    }

    this.destroy(rended);
  }

  clearItems() {
    for (const hand of this.hands) {
      hand.clear();
    }
    // TODO не уверен, но может быть
    this.hands.splice(0);

    for (const obj of this.objects) {
      // this.destroy(obj);
      obj.destroy();
    }
    this.objects.splice(0);
  }

  private destroy(obj: RenderObjectRepresentation) {
    if (obj instanceof CardObject && obj.inhand !== null) {
      const sceneHand = this.getHand(obj.inhand.hand);
      sceneHand.removeCardFromHand(obj);
    }
    obj.destroy();
  }

  moveItem(item: TableItem) {

    const obj = this.objects.find(o => o.gameObject.id === item.id);
    if (obj === undefined) {
      console.warn(`при муве такого нет ${item}`);
      return;
    }

    this.animka.moveObject2(obj, item.x, item.y);
  }

  createCursor(player: Player) {
    const cursor = CursorObject.create(player, this);
    this.objects.push(cursor);
    this.myEvents.emit("ObjectCreated", cursor);
  }

  createCard(card: Card, data: object | null) {
    console.log(`создаём карту...`);

    let obj: CardObject;
    if (data instanceof DeckCardRemovedData) {

      const deckObj = this.objects.find(o => o.gameObject.id === data.deck.id);
      if (deckObj === undefined) {
        console.warn(`createCard deckObj === undefined`);
        return;
      }

      const deckPos = deckObj.getCurrentPosition();

      obj = CardObject.create(card, this, deckPos.x, deckPos.y, Sizes.cardWidth, Sizes.cardHeight);
    }
    else {
      obj = CardObject.create(card, this, card.x, card.y, Sizes.cardWidth, Sizes.cardHeight);
    }
    card.render = obj;
    this.objects.push(obj);

    if (obj.inhand !== null) {
      const sceneHand = this.getHand(obj.inhand.hand);
      sceneHand.addCardToHand(obj, true);
    }

    this.myEvents.emit("ObjectCreated", obj);
  }

  flipCard(card: Card) {
    const obj = this.objects.find(o => o.gameObject.id === card.id) as CardObject;
    if (obj === undefined) {
      console.warn(`при flipCard такого нет ${card}`);
      return;
    }

    this.animka.flipCard(obj);
  }

  createDice(dice: Dice) {
    const obj = DiceObject.create(dice, this);
    dice.render = obj;
    this.objects.push(obj);
    this.myEvents.emit("ObjectCreated", obj);
  }

  rollDice(dice: Dice) {
    if (dice.render === undefined) {
      console.warn(`rollDice ${dice.id} undefined`);
      return;
    }

    const obj = dice.render as DiceObject;

    obj.roll();
  }

  updateDice(dice: Dice) {
    if (dice.render === undefined) {
      console.warn(`updateDice ${dice.id} undefined`);
      return;
    }

    const obj = dice.render as DiceObject;

    obj.updateSide();
  }

  createText(textItem: TextItem) {
    const obj = TextItemObject.create(textItem, this);
    this.objects.push(obj);
    this.myEvents.emit("ObjectCreated", obj);
  }

  createRectShape(shape: RectShape) {
    const obj = RectShapeObject.create(shape, this);
    this.objects.push(obj);
    this.myEvents.emit("ObjectCreated", obj);
  }

  createCircleShape(shape: CircleShape) {
    const obj = CircleShapeObject.create(shape, this);
    this.objects.push(obj);
    this.myEvents.emit("ObjectCreated", obj);
  }

  createMySprite(data: MySprite) {
    const obj = MySpriteObject.create(data, this);
    this.objects.push(obj);
    this.myEvents.emit("ObjectCreated", obj);
  }

  createMyTileSprite(data: MyTileSprite) {
    const obj = MyTileSpriteObject.create(data, this);
    this.objects.push(obj);
    this.myEvents.emit("ObjectCreated", obj);
  }

  createDeck(deck: Deck) {
    const obj = DeckObject.create(deck, this, Sizes.cardWidth, Sizes.cardHeight);
    deck.render = obj;
    this.objects.push(obj);
    this.myEvents.emit("ObjectCreated", obj);
  }

  updateDeck(deck: Deck) {
    const obj = this.objects.find(o => o.gameObject.id === deck.id) as DeckObject;
    if (obj === undefined) {
      console.warn(`при updateDeck такого нет ${deck}`);
      return;
    }

    obj.updateThingsPlease();
  }

  // я уже ваще ниче не понимаю
  insertCardToDeck(card: Card, data: DeckCardInsertedData) {
    const deckObj = this.objects.find(o => o.gameObject.id === data.deck.id) as DeckObject;
    if (deckObj === undefined) {
      console.warn(`при insertCardToDeck такого нет deck ${data.deck}`);
      return;
    }

    // xd
    // this.hander.removeCard(card);

    const cardObj = removeFromCollection(this.objects, o => o.gameObject.id === card.id) as CardObject | undefined;
    if (cardObj === undefined) {
      console.warn(`при insertCardToDeck такого нет card ${card}`);
      return;
    }

    this.animka.moveObjectToObject(cardObj, deckObj, () => {
      this.destroy(cardObj);
      deckObj.updateThingsPlease();
    });
  }

  removeCardFromDeck(card: Card, data: DeckCardRemovedData) {
    const deckObj = this.objects.find(o => o.gameObject.id === data.deck.id) as DeckObject;
    if (deckObj === undefined) {
      console.warn(`при insertCardToDeck такого нет deck ${data.deck}`);
      return;
    }

    deckObj.updateThingsPlease();

    this.createCard(card, data);
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
