export default class GameValues {
  public static readonly HandsArrayStartX = 0;
  public static readonly HandsArrayStartY = 0;
  public static readonly HandsArrayWidth = 600;
  public static readonly HandsArrayDistance = 100;

  public static rotatePosition(pos: Phaser.Math.Vector2, radians: number) {
    const length = pos.length();
    const normi = pos.normalize();

    const angle = normi.rotate(radians);

    return angle.setLength(length);
  }

  /**
   * Возвращает позицию карты внутри руки. 0 это центр руки. С ориджином 0.5 по иксу у карты
   * @param index
   * @param cardsCount
   * @param cardWidth
   * @param handWidth
   * @returns
   */
  public static calculatePosition(index: number, cardsCount: number, cardWidth: number, handWidth: number, radians: number) {

    if (cardsCount === 1) {
      return new Phaser.Math.Vector2(0, 0);
    }

    const wholeDisplayWidth = cardsCount * cardWidth;

    let x = 0;
    let y = 0;
    if (wholeDisplayWidth <= handWidth) {
      x = (index * cardWidth) - (wholeDisplayWidth / 2) + (cardWidth / 2);
      y = 0;
    }
    else {
      const cardDisplayWidth = cardWidth * ((handWidth - cardWidth) / (wholeDisplayWidth - cardWidth));

      x = index * cardDisplayWidth - (handWidth / 2) + (cardWidth / 2);
      y = 0;
    }

    const pos = new Phaser.Math.Vector2(x, y);

    if (radians !== 0)
      return this.rotatePosition(pos, radians);

    return pos;

    // let wholeDisplayWidth = cardsCount * cardWidth;
    // let cardDisplayWidth = cardWidth;

    // if (wholeDisplayWidth > handWidth) {
    //   cardDisplayWidth *= (handWidth / wholeDisplayWidth);
    //   wholeDisplayWidth = handWidth;
    // }

    // return (index * cardWidth) - (wholeDisplayWidth / 2) + (cardWidth / 2) - index * (cardWidth - cardDisplayWidth);
    // return (index * cardDisplayWidth) - (wholeDisplayWidth / 2);
  }
}
