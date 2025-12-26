import type CardFaceComplicated from "../../CardFaceComplicated";

export default interface CardFlippedMessage {
  card: number;
  front: CardFaceComplicated | number | null;
}
