import type Connection from "@/communication/Connection";
import type TypedEmitter from "@/utilities/TypedEmiiter";
import type CardPlayabilityChangedMessage from "./Messages/Server/CardPlayabilityChangedMessage";
import type CardUnplayabilityMessage from "./Messages/Server/CardUnplayabilityMessage";
import type Table from "@/actual/things/concrete/Table/Table";
import type TableItem from "../Table/TableItem";
import type Card from "../Cards/Card";
import { findComponent, replaceDtoComponent } from "@/utilities/Componenter";
import type Bench from "@/actual/Bench";
import type { PlayableComponent, PlayableComponentDto } from "./PlayableComponent";
import { removeItemFromCollection } from "@/utilities/MyCollections";
import type PlayCardMessage from "./Messages/Client/PlayCardMessage";

type PlayableEvents = {
  Playable: (card: Card, component: PlayableComponent) => void;
  UnPlayable: (card: Card) => void;
}

export default class PlayableSystem {
  readonly events: TypedEmitter<PlayableEvents> = new Phaser.Events.EventEmitter();

  readonly table: Table;
  readonly bench: Bench;

  connection: Connection | null = null;

  constructor(table: Table, bench: Bench) {
    this.table = table;
    this.bench = bench;

    this.table.events.on("EntityAdded", (item) => this.itemAdded(item));
  }

  subscribeToConnection(connection: Connection) {
    this.connection = connection;
    connection.registerForMessage<CardPlayabilityChangedMessage>("CardPlayabilityChangedMessage", msg => this.cardPlayabilityChanged(msg));
    connection.registerForMessage<CardUnplayabilityMessage>("CardUnplayabilityMessage", msg => this.cardUnplayability(msg));
  }

  play(card: Card, item: TableItem | undefined) {

    const message: PlayCardMessage = {
      card: card.id,
      target: item?.id ?? null
    };

    this.connection?.sendMessage("PlayCardMessage", message);
  }

  private itemAdded(item: TableItem): void {
    if (item.type !== "Card")
      return;

    // const card = item as Card;

    const component = replaceDtoComponent(item, "PlayableComponent", (dto: PlayableComponentDto) => {

      const owner = this.bench.entities.find(s => s.id === dto.owner);
      if (owner === undefined) {
        console.error(`PlayableSystem itemAdded owner ${dto.owner}`);
        return;
      }

      let targets: TableItem[] | null = null;
      if (dto.targets !== null) {
        targets = dto.targets.map(t => this.table.get(t));
      }

      const component: PlayableComponent = {
        id: dto.id,
        type: dto.type,
        owner: owner,
        targets: targets,
      };

      return component;
    });

    // if (component === undefined)
    //   return;
  }

  private cardPlayabilityChanged(msg: CardPlayabilityChangedMessage): void {

    const card = this.table.findCast<Card>(msg.card);

    if (card === undefined) {
      console.warn(`cardPlayabilityChanged не удалось найти карту ${msg.card}`);
      return;
    }

    const owner = this.bench.entities.find(s => s.id === msg.owner);
    if (owner === undefined) {
      console.error(`PlayableSystem itemAdded owner ${msg.owner}`);
      return;
    }

    let targets: TableItem[] | null = null;
    if (msg.targets !== null) {
      targets = msg.targets.map(t => this.table.get(t));
    }

    const component: PlayableComponent = {
      id: -1,
      type: "PlayableComponent",
      owner: owner,
      targets: targets,
    };

    card.components.push(component);

    this.events.emit("Playable", card, component);
  }

  private cardUnplayability(msg: CardUnplayabilityMessage): void {
    const card = this.table.getCast<Card>(msg.card);

    if (card === undefined) {
      console.warn(`cardUnplayability не удалось найти карту ${msg.card}`);
      return;
    }

    const component = findComponent<PlayableComponent>(card, "PlayableComponent");

    if (component === undefined) {
      console.warn(`cardUnplayability component === undefined`);
      return;
    }

    removeItemFromCollection(card.components, component);

    this.events.emit("UnPlayable", card);
  }
}
