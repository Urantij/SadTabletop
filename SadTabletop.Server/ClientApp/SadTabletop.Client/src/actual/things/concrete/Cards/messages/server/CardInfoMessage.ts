import type CardFaceComplicated from "../../CardFaceComplicated";

export default interface CardInfoMessage {
  card: number;
  front: CardFaceComplicated | number | null;
}
