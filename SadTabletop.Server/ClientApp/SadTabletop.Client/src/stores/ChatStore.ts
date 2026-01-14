import type ChatMessage from "@/actual/things/concrete/Chat/ChatMessage";
import { defineStore } from "pinia";

export const useChatStore = defineStore('chat', () => {

  function addMessage(message: ChatMessage) {
  }

  function sendMessage(content: string) {
  }

  return { addMessage, sendMessage };
});
