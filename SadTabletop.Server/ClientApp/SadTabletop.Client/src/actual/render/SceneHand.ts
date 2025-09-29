import { removeItemFromCollection } from "@/utilities/MyCollections";
import type Card from "../things/concrete/Cards/Card";
import type { InHandComponent } from "../things/concrete/Hands/InHandComponent";
import type BaseScene from "./BaseScene";
import { findComponentForSure } from "@/utilities/Componenter";
import GameValues from "../GameValues";
import CardObject from "./objects/CardObject";
import type Hand from "../things/concrete/Hands/Hand";

export default class SceneHand {
  readonly scene: BaseScene;

  readonly objs: CardObject[] = [];

  readonly handPositionX: number;
  readonly handPositionY: number;
  readonly handWidth: number;
  readonly radians: number;
  readonly cardWidth: number;
  readonly nonTopYDiff: number;

  ignoreMovement: CardObject[] = [];

  top: CardObject | null = null;

  readonly hand: Hand | null;

  constructor(scene: BaseScene, hand: Hand | null, handPositionX: number, handPositionY: number, handWidth: number, radians: number, cardWidth: number, nonTopYDiff: number) {
    this.scene = scene;
    this.hand = hand;
    this.handPositionX = handPositionX;
    this.handPositionY = handPositionY;
    this.handWidth = handWidth;
    this.radians = radians;
    this.cardWidth = cardWidth;
    this.nonTopYDiff = nonTopYDiff;
  }

  static create(scene: BaseScene, hand: Hand | null, x: number, y: number, width: number, radians: number, cardWidth: number, nonTopYDiff: number) {

    const result = new SceneHand(scene, hand, x, y, width, radians, cardWidth, nonTopYDiff);

    scene.leGame.hands.events.on("CardsSwapped", result.cardsSwapped, result);
    scene.leGame.hands.events.on("CardMovedInHand", result.cardMovedInHand, result);

    return result;
  }

  public setTop(obj: CardObject | null) {
    this.top = obj;
    // this.updateAbove();
    this.updateAll();
  }

  public clear() {
    this.objs.splice(0);
    this.ignoreMovement.splice(0);
    this.top = null;
  }

  public addCardToHand(obj: CardObject, move: boolean) {

    this.objs.push(obj);
    this.objs.sort((a, b) => a.inhand!.index - b.inhand!.index);

    obj.sprite.setRotation(this.radians);

    if (!move) {
      const pos = this.getCardResultPosition(obj, obj.inhand!.index);

      obj.sprite.x = this.handPositionX + pos.x;
      obj.sprite.y = this.handPositionY + pos.y;
    }

    this.updateAll();
  }

  public removeCardFromHand(obj: CardObject) {
    if (!removeItemFromCollection(this.objs, obj)) {
      console.warn(`removeCardFromHand ${obj.gameObject.id}`);
      return;
    }

    obj.sprite.setRotation(0);

    this.updateAll();
  }

  public ignoreMove(card: CardObject) {
    this.ignoreMovement.push(card);
  }

  public unignoreMove(card: CardObject) {
    removeItemFromCollection(this.ignoreMovement, card);
  }

  public refresh() {
    this.updateAll();
  }

  private cardsSwapped(card1: Card, card2: Card) {
    const component1 = findComponentForSure<InHandComponent>(card1, "InHandComponent");

    if (this.hand !== null) {
      if (this.hand !== component1.hand)
        return;
    }
    else {
      if (component1.hand.owner !== this.scene.leGame.ourPlayer?.seat)
        return;
    }

    const component2 = findComponentForSure<InHandComponent>(card2, "InHandComponent");

    // ну они уже сваанулись
    const obj1 = this.objs[component2.index];
    const obj2 = this.objs[component1.index];

    this.objs[component1.index] = obj1;
    this.objs[component2.index] = obj2;

    // да обновить можно только двух но код писать мне впадлу TODO
    this.updateAll();
  }

  private cardMovedInHand(card: Card, component: InHandComponent) {
    if (this.hand !== null) {
      if (this.hand !== component.hand)
        return;
    }
    else {
      if (component.hand.owner !== this.scene.leGame.ourPlayer?.seat)
        return;
    }

    const oldIndex = this.objs.findIndex(o => o.gameObject === card);
    // я не буду обрабатывать -1

    // а это ваще нужно?
    const obj = this.objs.splice(oldIndex, 1)[0];
    this.objs.splice(component.index, 0, obj);

    this.updateAll();
  }

  private updateAll() {
    let prev: CardObject | null = null;

    for (let index = 0; index < this.objs.length; index++) {
      const element = this.objs[index];

      if (prev != null)
        this.scene.children.moveAbove(element.sprite, this.objs[index - 1].sprite);

      if (!this.ignoreMovement.includes(element)) {

        const pos = this.getCardResultPosition(element, index);

        this.scene.animka.moveObject2(element, this.handPositionX + pos.x, this.handPositionY + pos.y);
      }

      if (element !== this.top)
        prev = element;
    }
  }

  private updateAbove() {
    let prev: CardObject | null = null;

    for (let index = 0; index < this.objs.length; index++) {
      const element = this.objs[index];

      if (prev != null)
        this.scene.children.moveAbove(element.sprite, this.objs[index - 1].sprite);

      if (element !== this.top)
        prev = element;
    }

    if (this.top !== null) {
      const last = this.objs[this.objs.length - 1];
      if (last !== this.top) {
        this.scene.children.moveAbove(this.top.sprite, last.sprite);
      }
    }
  }

  private getCardResultPosition(element: CardObject, index: number) {
    const basePos = this.getCardHandBasePosition(index);

    if (element !== this.top)
      basePos.y += this.nonTopYDiff;

    return GameValues.rotatePosition(basePos, this.radians);
  }

  /**
   * Базовая позиция карты внутри руки - не применены нон-топ высота и поворот.
   * @param index
   * @returns
   */
  public getCardHandBasePosition(index: number) {
    return GameValues.calculatePosition(index, this.objs.length, this.cardWidth, this.handWidth, 0);
  }
}
