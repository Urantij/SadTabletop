import { findComponent, findComponentForSure } from "@/utilities/Componenter";
import type Card from "../things/concrete/Cards/Card";
import type { InHandComponent } from "../things/concrete/Hands/InHandComponent";
import type TableItem from "../things/TableItem";
import InHandCardObject, { inhandCardWidth } from "./objects/InHandCardObject";
import { removeFromCollection } from "@/utilities/MyCollections";
import { DepthChart } from "./Renderer";
import GameValues from "../GameValues";
import type HandScene from "./HandScene";

const handPositionX = 0;
const handPositionY = 0;
const handWidth = 600;

export default class SceneHand {

  // readonly handCamera: Phaser.Cameras.Scene2D.Camera;
  readonly scene: HandScene;

  readonly objs: InHandCardObject[] = [];

  hoveredObject: InHandCardObject | null = null;
  relativePointerPosition: Phaser.Math.Vector2 | null = null;

  dragObj: InHandCardObject | null = null;

  constructor(scene: HandScene) {
    this.scene = scene;
  }

  static create(scene: HandScene) {

    scene.cameras.main.centerOn(handPositionX, handPositionY);
    scene.cameras.main.scrollY -= scene.cameras.main.height / 2;

    const hand = new SceneHand(scene);

    scene.leGame.hands.events.on("CardMovedToHand", hand.cardMovedTohand, hand);
    scene.leGame.hands.events.on("CardRemovedFromHand", hand.cardRemovedFromHand, hand);
    scene.leGame.hands.events.on("CardsSwapped", hand.cardsSwapped, hand);
    scene.leGame.hands.events.on("CardMovedInHand", hand.cardMovedInHand, hand);
    scene.leGame.table.events.on("ItemAdded", hand.itemAdded, hand);
    scene.leGame.table.events.on("ItemRemoved", hand.itemRemoved, hand);
    scene.leGame.table.events.on("Clearing", hand.clearing, hand);

    scene.input.on("pointermove", hand.pointerMoved, hand);

    return hand;
  }

  private cardMovedTohand(card: Card, component: InHandComponent) {
    if (component.hand.owner !== this.scene.leGame.ourPlayer?.seat)
      return;

    this.createCardObject(card, component);
  }

  private cardRemovedFromHand(card: Card) {
    const obj = removeFromCollection(this.objs, o => o.gameObject === card);

    if (obj === undefined)
      return;

    obj.destroy();

    this.updatePositions();
  }

  private cardsSwapped(card1: Card, card2: Card) {
    const component1 = findComponentForSure<InHandComponent>(card1, "InHandComponent");

    if (component1.hand.owner !== this.scene.leGame.ourPlayer?.seat)
      return;

    const component2 = findComponentForSure<InHandComponent>(card2, "InHandComponent");

    // ну они уже сваанулись
    const obj1 = this.objs[component2.index];
    const obj2 = this.objs[component1.index];

    this.objs[component1.index] = obj1;
    this.objs[component2.index] = obj2;

    // да обновить можно только двух но код писать мне впадлу TODO
    this.updatePositions();
  }

  private cardMovedInHand(card: Card, component: InHandComponent) {
    if (component.hand.owner !== this.scene.leGame.ourPlayer?.seat)
      return;

    const oldIndex = this.objs.findIndex(o => o.gameObject === card);
    // я не буду обрабатывать -1

    // а это ваще нужно?
    const obj = this.objs.splice(oldIndex, 1)[0];
    this.objs.splice(component.index, 0, obj);

    this.updatePositions();
  }

  private itemAdded(item: TableItem) {
    if (item.type !== "Card")
      return;

    const card = item as Card;

    const inHand = findComponent<InHandComponent>(card, "InHandComponent");

    if (inHand === undefined || inHand.hand.owner !== this.scene.leGame.ourPlayer?.seat)
      return;

    this.createCardObject(card, inHand);
  }

  private itemRemoved(item: TableItem) {
    if (item.type !== "Card")
      return;

    const obj = removeFromCollection(this.objs, o => o.gameObject === item);

    if (obj === undefined)
      return;

    obj.destroy();

    this.updatePositions();
  }

  private clearing() {
    for (const obj of this.objs.splice(0)) {
      obj.destroy();
    }
    this.hoveredObject = null;
  }

  private pointerMoved(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) {
    // console.log(`hand move ${currentlyOver.length}`);
    if (currentlyOver.length === 0) {
      if (this.hoveredObject !== null) {
        this.hoveredObject = null;
        this.updateHoverness();
      }
      return;
    }

    const overedSprite = currentlyOver[0];
    const overedObj = this.objs.find(o => o.sprite === overedSprite);

    if (overedObj === undefined) {
      if (this.hoveredObject !== null) {
        this.hoveredObject = null;
        this.updateHoverness();
      }
      return;
    }

    const pointerHandWorldPosition = pointer.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;

    const closest = this.objs
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
      this.hoveredObject = closest.obj;
      this.relativePointerPosition = this.getRelativePosition(pointer, closest.obj);
      this.updateHoverness();
    }
    else {
      this.relativePointerPosition = this.getRelativePosition(pointer, closest.obj);
    }
  }

  // тока один объект в массиве всегда
  // private pointerMoved(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) {
  //   const overed = this.objs
  //     .filter(o => currentlyOver.find(overed => overed === o.sprite) !== undefined)
  //     .map(obj => ({
  //       obj: obj,
  //       distance: this.eueueue(pointer, obj)
  //     }))
  //     .sort((a, b) => a.distance - b.distance);

  //   if (overed.length === 0) {

  //     if (this.hoveredObject !== null) {
  //       this.hoveredObject = null;
  //       this.updateHoverness();
  //     }

  //     return;
  //   }

  //   const first = overed[0];

  //   if (first.obj !== this.hoveredObject) {
  //     this.hoveredObject = first.obj;
  //     this.updateHoverness();
  //   }
  // }

  private createCardObject(card: Card, component: InHandComponent) {
    const obj = InHandCardObject.create(card, component, this.scene);
    const inHandXPosition = GameValues.calculatePosition(component.index, component.hand.cards.length, inhandCardWidth, handWidth, 0).x;
    obj.sprite.x = handPositionX + inHandXPosition;
    obj.sprite.y = handPositionY;
    obj.sprite.setOrigin(0.5, 1);
    obj.sprite.on("drag", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => this.cardDrag(obj, pointer, dragX, dragY), this);
    obj.sprite.on("dragend", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => this.cardDragEnd(obj, pointer, dragX, dragY), this);
    // obj.sprite.on("pointerover", (poiner: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
    //   this.hoveredObject = obj;
    //   this.updateHoverness();
    // });
    // obj.sprite.on("pointerout", (poiner: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
    //   if (this.hoveredObject !== obj)
    //     return;
    //   this.hoveredObject = null;
    //   this.updateHoverness();
    // });

    // if (component.index <= this.objs.length) {
    //   this.objs.splice(component.index, 0, obj);
    // }
    // else {
    //   this.objs.push(obj);
    // }
    // а я так уж хочу держать сортированную коллекцию карт в руке?
    this.objs.push(obj);
    this.objs.sort((a, b) => a.component.index - b.component.index);
    this.updatePositions();
  }

  private cardDrag(obj: InHandCardObject, pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
    if (this.dragObj === null) {
      this.dragObj = obj;
    }

    this.scene.animka.moveObject2(obj, dragX, dragY, null, 3);
  }

  private cardDragEnd(obj: InHandCardObject, pointer: Phaser.Input.Pointer, _dragX: number, _dragY: number) {
    if (this.dragObj !== obj)
      return;

    // в драг енде драг аргументы какие то ёбаные. не знаю, что там лежит.

    this.dragObj = null;

    let lefter: InHandCardObject | null = null;
    let righter: InHandCardObject | null = null;

    for (const card of this.objs) {
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

    const hand = this.scene.leGame.hands.getHand(this.scene.leGame.ourPlayer!.seat!);

    let index = -1;
    if (lefter === null) {
      index = 0;
    }
    else if (righter === null) {
      index = hand.cards.length;
    }
    // я кстати до сих пор не пон почему так, но оно так
    else if (righter.component.index < obj.component.index) {
      index = this.objs.indexOf(righter);
    }
    else {
      index = this.objs.indexOf(righter) - 1;
    }

    // TODO можно чето получше придумать)
    this.updatePositions();

    this.scene.leGame.hands.moveCard(obj.gameObject, index);
  }

  private updateHoverness() {
    for (let index = 0; index < this.objs.length; index++) {
      const element = this.objs[index];

      this.updateObjHoverness(element);
    }
  }

  private updatePositions() {
    for (let index = 0; index < this.objs.length; index++) {
      const element = this.objs[index];

      // не уверен ще тут надо
      if (element === this.dragObj)
        continue;

      const inHandXPosition = GameValues.calculatePosition(element.component.index, element.component.hand.cards.length, inhandCardWidth, handWidth, 0).x;

      // element.changePosition(handPositionX + inHandXPosition, handPositionY);
      this.scene.animka.moveObject2(element, handPositionX + inHandXPosition, handPositionY);
      this.updateObjHoverness(element);
    }
  }

  private updateObjHoverness(element: InHandCardObject) {

    if (element === this.dragObj || (element === this.hoveredObject && this.dragObj === null)) {
      element.setDepth(DepthChart.CardEnd);
      // )
      element.sprite.setScale(1.2, 1.2);
      return;
    }

    element.setDepth(DepthChart.CardStart + element.component.index);
    element.sprite.setScale(1, 1);
  }

  /**
   * Возвращает 0-1 позицию курсора внутри карты
   * @param pointer
   * @param element
   * @returns
   */
  private getRelativePosition(pointer: Phaser.Input.Pointer, element: InHandCardObject) {
    const cursorPos = pointer.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;

    // const spritePos = element.sprite.getLocalPoint(cursorPos.x, cursorPos.y, undefined, this.handCamera);

    const spritePos = element.sprite.getCenter(undefined, true);

    cursorPos.x -= spritePos.x;
    cursorPos.y -= spritePos.y;

    cursorPos.x /= element.sprite.displayWidth;
    cursorPos.y /= element.sprite.displayHeight;

    return cursorPos;
  }
}
