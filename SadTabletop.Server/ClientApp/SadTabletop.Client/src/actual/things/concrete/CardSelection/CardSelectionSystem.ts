import type LeGame from "@/actual/LeGame";
import EntitiesSystem from "../../EntitiesSystem";
import type CardSelectionData from "./CardSelectionData";
import type DeckCardInfo from "../Decks/DeckCardInfo";
import type SelectCardsMessage from "./messages/client/SelectCardsMessage";
import { FixDeckCard } from "../Cards/CardCompareHelper";

export default class CardSelectionSystem extends EntitiesSystem<CardSelectionData> {

  readonly leGame: LeGame;

  constructor(leGame: LeGame) {
    super();
    this.leGame = leGame;
  }

  public sendSelection(selection: CardSelectionData, cards: DeckCardInfo[]) {
    const message: SelectCardsMessage = {
      selection: selection.id,
      cards: cards.map(c => c.id),
    };

    this.leGame.connection?.sendMessage("SelectCardsMessage", message);
  }

  override addSimple(arg0: CardSelectionData) {
    this.transform(arg0);
    super.addSimple(arg0, null);
  }

  isIncludedEntityByType(type: string) {
    return ["CardSelectionData"].includes(type);
  }

  private transform(data: CardSelectionData) {
    const id = data.target as unknown as number;
    data.target = this.leGame.bench.get(id);

    for (const card of data.cards) {
      FixDeckCard(card);
    }
  }
}
