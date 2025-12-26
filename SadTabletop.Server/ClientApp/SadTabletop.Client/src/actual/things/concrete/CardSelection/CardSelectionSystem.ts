import type LeGame from "@/actual/LeGame";
import EntitiesSystem from "../../EntitiesSystem";
import type CardSelectionData from "./CardSelectionData";

export default class CardSelectionSystem extends EntitiesSystem<CardSelectionData> {

  readonly leGame: LeGame;

  constructor(leGame: LeGame) {
    super();
    this.leGame = leGame;
  }

  addSimple(arg0: CardSelectionData) {
    this.transform(arg0);
    throw new Error("Method not implemented.");
  }

  isIncludedEntityByType(type: string) {
    return ["CardSelectionData"].includes(type);
  }

  private transform(data: CardSelectionData) {
    const id = data.target as unknown as number;
    data.target = this.leGame.bench.get(id);
  }
}
