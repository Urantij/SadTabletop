import type ChatEmbedBase from "../ChatEmbedBase";

export default interface ChatEmbedCustom extends ChatEmbedBase {
  text: string;
  color: string;
}
