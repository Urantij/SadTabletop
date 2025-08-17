export default class SidesCollection {

  private readonly sides: Map<number, string> = new Map();

  private readonly defaultFrontSide: string;
  private readonly defaultBackSide: string;

  constructor(defaultFrontSide: string, defaultBackSide: string) {
    this.defaultFrontSide = defaultFrontSide;
    this.defaultBackSide = defaultBackSide;
  }

  addSide(num: number, result: string) {
    this.sides.set(num, result);
  }

  getFrontSide(num: number | null) {
    if (num === null) {
      return this.defaultFrontSide;
    }

    return this.sides.get(num) ?? this.defaultFrontSide;
  }

  getBackSide(num: number | null) {
    if (num === null) {
      return this.defaultBackSide;
    }

    return this.sides.get(num) ?? this.defaultBackSide;
  }
}
