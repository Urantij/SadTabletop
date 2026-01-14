import type TypedEmitter from "@/utilities/TypedEmiiter";
import type LeGame from "@/actual/LeGame";
import type Connection from "@/communication/Connection";
import type NewChatMessageMessage from "./messages/server/NewChatMessageMessage";
import type ChatEmbedCard from "./Embeds/ChatEmbedCard";
import { CardFaceUncomplicateForSure } from "../Cards/CardCompareHelper";
import type SendChatMessageMessage from "./messages/client/SendChatMessageMessage";
import type ChatMessage from "./ChatMessage";

type ChatEvents = {
  NewMessageAppeared: (msg: ChatMessage) => void;
}

export default class ChatSystem {
  private readonly game: LeGame;

  readonly events: TypedEmitter<ChatEvents> = new Phaser.Events.EventEmitter();

  constructor(game: LeGame) {
    this.game = game;
  }

  subscribeToConnection(connection: Connection) {
    connection.registerForMessage<NewChatMessageMessage>("NewChatMessageMessage", msg => this.newMessage(msg));
  }

  public sendMessage(content: string) {

    const msg: SendChatMessageMessage = {
      content: content
    };

    this.game.connection?.sendMessage("SendChatMessageMessage", msg);
  }

  private newMessage(msg: NewChatMessageMessage): void {
    for (const embed of msg.content.embeds) {
      if ("front" in embed) {
        const cardEmbed = embed as ChatEmbedCard;

        cardEmbed.front = CardFaceUncomplicateForSure(cardEmbed.front);
        cardEmbed.back = CardFaceUncomplicateForSure(cardEmbed.back);
      }
    }

    this.events.emit("NewMessageAppeared", {
      name: msg.name,
      color: msg.color,
      content: msg.content
    });
  }
}
