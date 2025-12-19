import type CardFaceComplicated from "../Cards/CardFaceComplicated";

export default interface DeckCardInfo {
  id: number;
  back: CardFaceComplicated;
  front: CardFaceComplicated;
}
