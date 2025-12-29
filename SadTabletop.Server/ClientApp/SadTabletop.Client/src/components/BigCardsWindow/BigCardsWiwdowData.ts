import type DeckCardInfo from "@/actual/things/concrete/Decks/DeckCardInfo";
import type WiwdowBaseData from "../Wiwdow/WiwdowBaseData";

export default interface BigCardsWiwdowData extends WiwdowBaseData {
  cards: DeckCardInfo[],
  min: number,
  max: number,
}
