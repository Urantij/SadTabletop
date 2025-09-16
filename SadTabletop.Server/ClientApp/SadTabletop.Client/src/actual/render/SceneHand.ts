import { findComponent, findComponentForSure } from "@/utilities/Componenter";
import type Card from "../things/concrete/Cards/Card";
import type { InHandComponent } from "../things/concrete/Hands/InHandComponent";
import type TableItem from "../things/TableItem";
import type MainScene from "./MainScene";
import InHandCardObject, { handPositionX, handPositionY } from "./objects/InHandCardObject";
import { removeFromCollection } from "@/utilities/MyCollections";
import { DepthChart } from "./Renderer";

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

  private createCardObject(card: Card, component: InHandComponent) {
    const obj = InHandCardObject.create(card, component, this.scene);
    obj.sprite.setOrigin(0.5, 1);
    obj.sprite.on("pointerover", (poiner: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
      this.hoveredObject = obj;
      this.updateHoverness();
    });
    obj.sprite.on("pointerout", (poiner: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
      if (this.hoveredObject !== obj)
        return;
      this.hoveredObject = null;
      this.updateHoverness();
    });
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

      const pos = InHandCardObject.calculatePosition(index, this.objs.length);

      element.changePosition(pos.x, pos.y);
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
