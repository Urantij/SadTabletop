import type EngineChatMessage from "../../EngineChatMessage";

export default interface NewChatMessageMessage {
  name: string;
  color: string;
  content: EngineChatMessage;
}
