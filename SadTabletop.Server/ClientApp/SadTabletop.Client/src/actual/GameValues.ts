export default class GameValues {
  public static readonly HandsArrayStartX = 0;
  public static readonly HandsArrayStartY = 0;
  public static readonly HandsArrayWidth = 600;
  public static readonly HandsArrayDistance = 100;

  /**
   * Возвращает позицию карты внутри руки. 0 это центр руки. С ориджином 0.5 по иксу у карты
   * @param index
   * @param cardsCount
   * @param cardWidth
   * @param handWidth
   * @returns
   */
  public static calculatePosition(index: number, cardsCount: number, cardWidth: number, handWidth: number) {

    if (cardsCount === 1) {
      return 0;
    }

    let wholeDisplayWidth = cardsCount * cardWidth;

    if (wholeDisplayWidth <= handWidth) {
      return (index * cardWidth) - (wholeDisplayWidth / 2) + (cardWidth / 2);
    }

    const cardDisplayWidth = cardWidth * ((handWidth - cardWidth) / (wholeDisplayWidth - cardWidth));

    return index * cardDisplayWidth - (handWidth / 2) + (cardWidth / 2);

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
