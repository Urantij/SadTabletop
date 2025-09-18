export default class GameValues {
  public static readonly HandsArrayStartX = 0;
  public static readonly HandsArrayStartY = 0;
  public static readonly HandsArrayWidth = 600;
  public static readonly HandsArrayDistance = 100;

  /**
   * Возвращает позицию карты внутри руки.
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
    let cardDisplayWidth = cardWidth;

    if (wholeDisplayWidth > handWidth) {
      cardDisplayWidth *= handWidth / wholeDisplayWidth;
      wholeDisplayWidth = handWidth;
    }

    // старт + положение карты в массиве - половина отображаемой руки даст нужную позицию. и + половина карты так как ориджин Х 0.5, а не 0
    return 0 + cardDisplayWidth * index - wholeDisplayWidth / 2 + cardWidth / 2;
  }
}
