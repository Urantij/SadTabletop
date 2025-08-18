import type TypedEmitter from "@/utilities/TypedEmiiter";
import type JoinMessage from "./messages/client/JoinMessage";
import type MessageContainer from "./messages/MessageContainer";
import type JoinedMessage from "./messages/server/JoinedMessage";
import type PlayerJoinedMessage from "./messages/server/PlayerJoinedMessage";
import type PlayerLeftMessage from "./messages/server/PlayerLeftMessage";
import { useUserStore } from "@/stores/UserStore";
import type EntityAddedMessage from "./messages/server/EntityAddedMessage";
import type EntityRemovedMessage from "./messages/server/EntityRemovedMessage";
import type ItemMovedMessage from "./messages/server/ItemMovedMessage";

type MessageEvents = {
  MeJoined: (data: JoinedMessage) => void;
  PlayerJoined: (data: PlayerJoinedMessage) => void;
  PlayerLeft: (data: PlayerLeftMessage) => void;
  EntityAdded: (data: EntityAddedMessage) => void;
  EntityRemoved: (data: EntityRemovedMessage) => void;
  ItemMoved: (data: ItemMovedMessage) => void;
}

export default class Connection {

  private readonly address: string;

  private socket: WebSocket | null = null;

  readonly events: TypedEmitter<MessageEvents> = new Phaser.Events.EventEmitter();

  readonly userStore = useUserStore();

  constructor(address: string) {
    this.address = address;
  }

  sendMessage(messageName: string, content: object) {

    if (this.socket === null || this.socket.readyState !== this.socket.OPEN) {
      console.log(`Попытка отправить сообщение в молоко ${messageName}`);
      return;
    }

    const message: MessageContainer = {
      name: messageName,
      content: content
    };

    this.socket.send(JSON.stringify(message));
  }

  private messageReceived(rawData: unknown) {

    if (typeof rawData !== "string") {
      return;
    }

    const messageContainer: MessageContainer = JSON.parse(rawData);

    console.log(`+message`);
    console.log(messageContainer);

    if (messageContainer.name === "JoinedMessage") {
      const data = messageContainer.content as JoinedMessage;
      this.onJoinedMessage(data);
    }
    else if (messageContainer.name === "PlayerJoinedMessage") {
      const data = messageContainer.content as PlayerJoinedMessage;
      this.onPlayerJoinedMessage(data);
    }
    else if (messageContainer.name === "PlayerLeftMessage") {
      const data = messageContainer.content as PlayerLeftMessage;
      this.onPlayerLeftMessage(data);
    }
    else if (messageContainer.name === "EntityAddedMessage") {
      // мне стало впадлу это делать, ы
      this.events.emit("EntityAdded", messageContainer.content as EntityAddedMessage);
    }
    else if (messageContainer.name === "EntityRemovedMessage") {
      this.events.emit("EntityRemoved", messageContainer.content as EntityRemovedMessage);
    }
    else if (messageContainer.name === "ItemMovedMessage") {
      this.events.emit("ItemMoved", messageContainer.content as ItemMovedMessage);
    }
  }

  private connected() {
    const message: JoinMessage = {
      key: this.userStore.key,
      name: this.userStore.name,
    };

    this.sendMessage("JoinMessage", message);
  }

  private onJoinedMessage(data: JoinedMessage) {
    this.events.emit("MeJoined", data);
  }

  private onPlayerJoinedMessage(data: PlayerJoinedMessage) {
    this.events.emit("PlayerJoined", data);
  }

  private onPlayerLeftMessage(data: PlayerLeftMessage) {
    this.events.emit("PlayerLeft", data);
  }

  start() {

    this.socket = new WebSocket(`wss://${this.address}`);

    this.socket.onmessage = (ev) => {
      this.messageReceived(ev.data);
    };

    this.socket.onopen = () => {
      this.connected();
    };
  }
}
