import type CardFaceComplicated from "../../CardFaceComplicated";

export default interface CardFlippedMessage {
  card: number;
  frontSide: CardFaceComplicated | number | null;
}
