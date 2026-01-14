import type CardFaceComplicated from "../../Cards/CardFaceComplicated";
import type ChatEmbedBase from "../ChatEmbedBase";

export default interface ChatEmbedCard extends ChatEmbedBase {
  front: CardFaceComplicated;
  back: CardFaceComplicated;
}
