import { findComponent, findComponentForSure } from "@/utilities/Componenter";
import type Card from "../things/concrete/Cards/Card";
import type { InHandComponent } from "../things/concrete/Hands/InHandComponent";
import type TableItem from "../things/TableItem";
import type MainScene from "./MainScene";
import InHandCardObject, { inhandCardWidth } from "./objects/InHandCardObject";
import { removeFromCollection } from "@/utilities/MyCollections";
import { DepthChart } from "./Renderer";
import GameValues from "../GameValues";

const handPositionX = -10000;
const handPositionY = -10000;
const handWidth = 600;

export default class SceneHand {

  readonly handCamera: Phaser.Cameras.Scene2D.Camera;
  readonly scene: MainScene;

  readonly objs: InHandCardObject[] = [];

  hoveredObject: InHandCardObject | null = null;

  constructor(handCamera: Phaser.Cameras.Scene2D.Camera, scene: MainScene) {
    this.handCamera = handCamera;
    this.scene = scene;
  }

  static create(scene: MainScene) {

    const handCamera = scene.cameras.add();
    handCamera.centerOn(handPositionX, handPositionY);
    handCamera.scrollY -= handCamera.height / 2;

    const hand = new SceneHand(handCamera, scene);

    scene.leGame.hands.events.on("CardMovedToHand", hand.cardMovedTohand, hand);
    scene.leGame.hands.events.on("CardRemovedFromHand", hand.cardRemovedFromHand, hand);
    scene.leGame.hands.events.on("CardsSwapped", hand.cardsSwapped, hand);
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

    const pointerHandWorldPosition = pointer.positionToCamera(this.handCamera) as Phaser.Math.Vector2;

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
      this.updateHoverness();
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

  /**
   * Дистанция от курсора до центра карты
   * @param pointer
   * @param obj
   * @returns
   */
  private eueueue(pointer: Phaser.Input.Pointer, obj: InHandCardObject) {
    const pos = pointer.positionToCamera(this.handCamera) as Phaser.Math.Vector2;
    return pos.distanceSq(obj.sprite.getCenter());
  }

  private createCardObject(card: Card, component: InHandComponent) {
    const obj = InHandCardObject.create(card, component, this.scene);
    const inHandXPosition = GameValues.calculatePosition(component.index, component.hand.cards.length, inhandCardWidth, handWidth);
    obj.sprite.x = handPositionX + inHandXPosition;
    obj.sprite.y = handPositionY;
    obj.sprite.setOrigin(0.5, 1);
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
    this.objs.splice(component.index, 0, obj);
    this.updatePositions();
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

      const inHandXPosition = GameValues.calculatePosition(element.component.index, element.component.hand.cards.length, inhandCardWidth, handWidth);

      element.changePosition(handPositionX + inHandXPosition, handPositionY);
      this.updateObjHoverness(element);
    }
  }

  private updateObjHoverness(element: InHandCardObject) {
    if (element === this.hoveredObject) {
      element.setDepth(DepthChart.CardEnd);
      // )
      element.sprite.setScale(1.2, 1.2);
    }
    else {
      element.setDepth(DepthChart.CardStart + element.component.index);
      element.sprite.setScale(1, 1);
    }
  }
}
