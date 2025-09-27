import type Card from "../things/concrete/Cards/Card";
import type { InHandComponent } from "../things/concrete/Hands/InHandComponent";
import BaseScene from "./BaseScene";
import CardObject, { defaultBackSideKey, defaultFrontSidekey } from "./objects/CardObject";
import SceneHand from "./SceneHand";
import { findComponent } from "@/utilities/Componenter";

// почему тут? ну потому что ептыть
const inhandCardWidth = 250 * 0.8;
const inhandCardHeight = 350 * 0.8;

const handPositionX = 0;
const handPositionY = 0;
const handWidth = 600;

export const pointerOverHoveredName = "PointerOverHovered";

export default class HandScene extends BaseScene {

  hand: SceneHand = null!;

  hoveredObject: CardObject | null = null;
  relativePointerPosition: Phaser.Math.Vector2 | null = null;

  dragObj: CardObject | null = null;

  private preload() {
    console.log("preload");

    this.load.image(defaultBackSideKey, "back.png");
    this.load.image(defaultFrontSidekey, "front.png");

    for (const data of this.leGame.assetsData) {
      this.load.image(data.name, data.url);
    }
  }

  private create() {

    this.hand = SceneHand.create(this, null, handPositionX, handPositionY, handWidth, 0, inhandCardWidth);

    this.cameras.main.centerOn(handPositionX, handPositionY);
    this.cameras.main.scrollY -= this.cameras.main.height / 2;

    this.leGame.table.events.on("ItemAdded", (item) => {
      if (item.type !== "Card")
        return;

      const card = item as Card;

      const inHand = findComponent<InHandComponent>(card, "InHandComponent");

      if (inHand === undefined || inHand.hand.owner !== this.leGame.ourPlayer?.seat)
        return;

      const obj = this.createCardObject(card, inHand);
      this.hand.addCardToHand(obj, true);
    });
    this.leGame.table.events.on("ItemRemoved", (item) => {
      if (item.type !== "Card")
        return;

      const obj = this.hand.objs.find(c => c.gameObject === item);
      if (obj === undefined)
        return;

      if (this.dragObj === obj) {
        this.dragObj = null;
      }
      if (this.hoveredObject === obj) {
        this.hoveredObject = null;
      }

      this.hand.removeCardFromHand(obj);

      obj.destroy();
    });
    this.leGame.events.on("Clearing", () => {
      for (const obj of this.hand.objs) {
        obj.destroy();
      }
      this.hand.clear();

      this.dragObj = null;
      this.hoveredObject = null;
    });

    this.leGame.hands.events.on("CardMovedToHand", (card, component) => {

      if (component.hand.owner !== this.leGame.ourPlayer?.seat)
        return;

      const obj = this.createCardObject(card, component);

      this.hand.addCardToHand(obj, true);
    });
    this.leGame.hands.events.on("CardRemovedFromHand", (card, hand) => {

      const obj = this.hand.objs.find(o => o.gameObject === card);
      if (obj === undefined) {
        console.warn(`нет обекта CardRemovedFromHand ${card.id}`);
        return;
      }

      this.hand.removeCardFromHand(obj);

      obj.destroy();
    });

    this.input.on("pointermove", this.pointerMoved, this);

    // я понятия нахуй не имею что происходит
    // в старом проекте реди шло когда сцена была ГОТОВА
    // ща оно вылетает ДО ПРЕЛОАДА БЛЯТЬ
    this.events.emit("READY)))");
  }

  private createCardObject(card: Card, component: InHandComponent) {
    const obj = CardObject.create(card, this, this.hand.handPositionX, this.hand.handPositionY, inhandCardWidth, inhandCardHeight);

    if (obj.sprite.input === null) {
      const config: Phaser.Types.Input.InputConfiguration = {
        draggable: true,
      };
      obj.sprite.setInteractive(config);
    }
    else {
      this.input.setDraggable(obj.sprite, true);
    }

    obj.sprite.setOrigin(0.5, 1);
    obj.sprite.on("drag", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => this.cardDrag(obj, pointer, dragX, dragY), this);
    obj.sprite.on("dragend", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => this.cardDragEnd(obj, pointer, dragX, dragY), this);

    return obj;
  }

  private pointerMoved(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) {
    // console.log(`hand move ${currentlyOver.length}`);

    if (currentlyOver.length === 0) {
      if (this.hoveredObject !== null) {
        this.hoveredObject.sprite.setScale(1, 1);
        this.hoveredObject = null;
        this.hand.setTop(null);
      }
      return;
    }

    const overedSprite = currentlyOver[0];
    const overedObj = this.hand.objs.find(o => o.sprite === overedSprite);

    if (overedObj === undefined) {
      if (this.hoveredObject !== null) {
        this.hoveredObject.sprite.setScale(1, 1);
        this.hoveredObject = null;
        this.hand.setTop(null);
      }
      return;
    }

    const pointerHandWorldPosition = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

    const closest = this.hand.objs
      .map(o => {

        const scale = o.sprite.scale;
        o.sprite.scale = 1;
        const center = o.sprite.getCenter();
        o.sprite.scale = scale;

        return {
          obj: o,
          distance: pointerHandWorldPosition.distanceSq(center)
        }
      })
      .sort((a, b) => a.distance - b.distance)[0];

    if (closest.obj !== this.hoveredObject) {

      if (this.hoveredObject !== null) {
        this.hoveredObject.sprite.setScale(1, 1);
      }

      this.hoveredObject = closest.obj;
      this.relativePointerPosition = this.getRelativePosition(pointer, closest.obj);

      this.hoveredObject.sprite.setScale(1.2, 1.2);
      this.hand.setTop(this.hoveredObject);
    }
    else {
      this.relativePointerPosition = this.getRelativePosition(pointer, closest.obj);
    }

    this.events.emit(pointerOverHoveredName, this.hoveredObject, this.relativePointerPosition);
  }

  private cardDrag(obj: CardObject, pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
    if (this.dragObj === null) {
      this.dragObj = obj;
      this.hand.ignoreMove(obj);
    }

    this.animka.moveObject2(obj, dragX, dragY, null, 3);
  }

  private cardDragEnd(obj: CardObject, pointer: Phaser.Input.Pointer, _dragX: number, _dragY: number) {
    if (this.dragObj !== obj)
      return;

    // в драг енде драг аргументы какие то ёбаные. не знаю, что там лежит.

    this.hand.unignoreMove(obj);
    this.dragObj = null;

    let lefter: CardObject | null = null;
    let righter: CardObject | null = null;

    for (const card of this.hand.objs) {
      if (card === obj)
        continue;

      if (card.sprite.x < obj.sprite.x) {
        lefter = card;
      }
      else if (righter === null) {
        righter = card;
        break;
      }
    }

    const hand = this.leGame.hands.getHand(this.leGame.ourPlayer!.seat!);

    let index = -1;
    if (lefter === null) {
      index = 0;
    }
    else if (righter === null) {
      index = hand.cards.length;
    }
    // я кстати до сих пор не пон почему так, но оно так
    else if (righter.inhand!.index < obj.inhand!.index) {
      index = this.hand.objs.indexOf(righter);
    }
    else {
      index = this.hand.objs.indexOf(righter) - 1;
    }

    // TODO можно чето получше придумать)
    this.hand.refresh();

    this.leGame.hands.moveCard(obj.gameObject, index);
  }

  /**
   * Возвращает 0-1 позицию курсора внутри карты
   * @param pointer
   * @param element
   * @returns
   */
  private getRelativePosition(pointer: Phaser.Input.Pointer, element: CardObject) {
    const cursorPos = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

    // const spritePos = element.sprite.getLocalPoint(cursorPos.x, cursorPos.y, undefined, this.handCamera);

    const spritePos = element.sprite.getCenter(undefined, true);

    cursorPos.x -= spritePos.x;
    cursorPos.y -= spritePos.y;

    cursorPos.x /= element.sprite.displayWidth;
    cursorPos.y /= element.sprite.displayHeight;

    return cursorPos;
  }
}
