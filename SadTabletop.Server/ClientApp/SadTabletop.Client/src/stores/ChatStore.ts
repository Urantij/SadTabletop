import type ChatMessage from "@/actual/things/concrete/Chat/ChatMessage";
import { defineStore } from "pinia";

export const useChatStore = defineStore('chat', () => {

  const msgs: ChatMessage[] = [];

  function reset(messages: ChatMessage[]) {
    msgs.splice(0, msgs.length, ...messages);
  }

  function addMessage(message: ChatMessage) {
    msgs.push(message);
  }

  function sendMessage(content: string) {
  }

  function get() {
    return msgs;
  }

  return { addMessage, sendMessage, reset, get };
});
