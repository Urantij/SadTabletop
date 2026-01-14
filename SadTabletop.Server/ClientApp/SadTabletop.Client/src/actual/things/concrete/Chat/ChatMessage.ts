import type EngineChatMessage from "./EngineChatMessage";

export default interface ChatMessage {
  name: string;
  color: string;
  content: EngineChatMessage;
}
