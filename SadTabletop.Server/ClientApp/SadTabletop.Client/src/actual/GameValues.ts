import { findComponent } from "@/utilities/Componenter";
import type Bench from "./Bench";
import type { InHandComponent } from "./things/concrete/Hands/InHandComponent";
import type HandOverrideComponent from "./things/concrete/Hands/HandOverrideComponent";
import { cardWidth } from "./render/objects/CardObject";

export default class GameValues {
  public static readonly HandsArrayStartX = 0;
  public static readonly HandsArrayStartY = 0;
  public static readonly HandsArrayWidth = 600;
  public static readonly HandsArrayDistance = 100;

  // TODO наверное не тут
  // TODO наверное лучше индекс ситов добавить в ситы, а не искать каждый раз? :)
  public static calculateCardPosition(bench: Bench, component: InHandComponent) {

    const seatIndex = bench.seats.indexOf(component.hand.owner);

    // я не буду обрабатывать -1

    const handOverride = findComponent<HandOverrideComponent>(component.hand.owner, "HandOverrideComponent");

    const handStartX = handOverride?.x ?? this.HandsArrayStartX + seatIndex * (this.HandsArrayWidth + this.HandsArrayDistance);
    const handStartY = handOverride?.y ?? this.HandsArrayStartY

    const line = new Phaser.Geom.Line(handStartX, handStartY, this.HandsArrayWidth - cardWidth, 0);

    const points = Phaser.Geom.Line.GetPoints(line, component.hand.cards.length);

    return points[component.index];

    // зна4ица й хо4у 4тобы карты клались в центр. и двигались до краев обозна4енной ширины
    // если карты не вмещаютсй в ширину, уменьшать дистанцию менжду картами. воооот

    // const wholeLength = cardWidth * component.hand.cards.length;

    // let inHandX = this.HandsArrayWidth / 2;

    // const middle = component.hand.cards.length / 2;
    // const middleIndex = Math.floor(middle);

    // const abb = wholeLength / c

    // if (component.hand.cards.length % 2 > 0 && component.index === middleIndex) {
    //   inHandX -= cardWidth / 2;
    // }
    // else {

    // }
  }
}
