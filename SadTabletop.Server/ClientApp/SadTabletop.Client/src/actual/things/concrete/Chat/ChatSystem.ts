import type TypedEmitter from "@/utilities/TypedEmiiter";
import type LeGame from "@/actual/LeGame";
import type Connection from "@/communication/Connection";
import type NewChatMessageMessage from "./messages/server/NewChatMessageMessage";
import type ChatEmbedCard from "./Embeds/ChatEmbedCard";
import { CardFaceUncomplicateForSure } from "../Cards/CardCompareHelper";
import type SendChatMessageMessage from "./messages/client/SendChatMessageMessage";
import type ChatMessage from "./ChatMessage";
import type JoinedMessage from "@/communication/messages/server/JoinedMessage";

type ChatEvents = {
  Reset: (msgs: ChatMessage[]) => void;
  NewMessageAppeared: (msg: ChatMessage) => void;
}

export default class ChatSystem {
  private readonly game: LeGame;

  readonly events: TypedEmitter<ChatEvents> = new Phaser.Events.EventEmitter();

  constructor(game: LeGame) {
    this.game = game;
  }

  subscribeToConnection(connection: Connection) {
    connection.registerForMessage<JoinedMessage>("JoinedMessage", msg => this.joined(msg));
    connection.registerForMessage<NewChatMessageMessage>("NewChatMessageMessage", msg => this.newMessage(msg));
  }

  public sendMessage(content: string) {

    const msg: SendChatMessageMessage = {
      content: content
    };

    this.game.connection?.sendMessage("SendChatMessageMessage", msg);
  }

  private joined(joined: JoinedMessage): void {
    for (const msg of joined.messages) {
      this.fixMessage(msg);
    }

    this.events.emit("Reset", joined.messages);
  }

  private newMessage(msg: NewChatMessageMessage): void {
    this.fixMessage(msg);

    this.events.emit("NewMessageAppeared", {
      name: msg.name,
      color: msg.color,
      content: msg.content
    });
  }

  private fixMessage(msg: ChatMessage) {
    for (const embed of msg.content.embeds) {
      if ("front" in embed) {
        const cardEmbed = embed as ChatEmbedCard;

        cardEmbed.front = CardFaceUncomplicateForSure(cardEmbed.front);
        cardEmbed.back = CardFaceUncomplicateForSure(cardEmbed.back);
      }
    }
  }
}
