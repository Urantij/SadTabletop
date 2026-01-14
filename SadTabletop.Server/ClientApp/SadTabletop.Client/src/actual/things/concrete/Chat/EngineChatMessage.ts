import type ChatEmbedBase from "./ChatEmbedBase";

export default interface EngineChatMessage {
  content: string;
  embeds: ChatEmbedBase[];
}
