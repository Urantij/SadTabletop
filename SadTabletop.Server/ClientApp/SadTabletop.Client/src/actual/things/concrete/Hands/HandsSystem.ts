import type Table from "@/actual/Table";
import type Connection from "@/communication/Connection";
import type TypedEmitter from "@/utilities/TypedEmiiter";
import type CardMovedToHandMessage from "./messages/server/CardMovedToHandMessage";
import type CardRemovedFromHandMessage from "./messages/server/CardRemovedFromHandMessage";
import type CardsSwappedMessage from "./messages/server/CardsSwappedMessage";
import type TableItem from "../../TableItem";
import type Card from "../Cards/Card";
import type Bench from "@/actual/Bench";
import type { InHandComponent, InHandComponentDto } from "./InHandComponent";
import { findComponent, findComponentForSure, replaceDtoComponent } from "@/utilities/Componenter";
import { removeItemFromCollection } from "@/utilities/MyCollections";
import Hand from "./Hand";
import type Seat from "../../Seat";

type MessageEvents = {
  CardMovedToHand: (card: Card) => void;
  CardRemovedFromHand: (card: Card, hand: Hand) => void;
  CardsSwapped: (card1: Card, card2: Card) => void;
}

export default class HandsSystem {

  readonly table: Table;
  readonly bench: Bench;

  readonly hands: Hand[] = [];

  readonly events: TypedEmitter<MessageEvents> = new Phaser.Events.EventEmitter();

  constructor(table: Table, bench: Bench) {
    this.table = table;
    this.bench = bench;

    this.table.events.on("ItemAdded", (item) => this.itemAdded(item));
    // this.table.events.on("ItemRemoved", (item) => this.itemRemoved(item));
  }

  subscribeToConnection(connection: Connection) {
    connection.registerForMessage<CardMovedToHandMessage>("CardMovedToHandMessage", msg => this.cardMovedToHand(msg));
    connection.registerForMessage<CardRemovedFromHandMessage>("CardRemovedFromHandMessage", msg => this.cardRemovedFromHand(msg));
    connection.registerForMessage<CardsSwappedMessage>("CardsSwappedMessage", msg => this.cardsSwapped(msg))
  }

  getHand(owner: Seat) {
    //ы
    let hand = this.hands.find(h => h.owner === owner);

    if (hand === undefined) {
      hand = new Hand(owner);
      this.hands.push(hand);
    }

    return hand;
  }

  private itemAdded(item: TableItem): void {
    if (item.type !== "Card")
      return;

    const card = item as Card;

    replaceDtoComponent(item, "InHandComponent", (dto: InHandComponentDto) => {

      const owner = this.bench.seats.find(s => s.id === dto.owner);
      if (owner === undefined) {
        console.warn(`itemAdded owner ${dto.owner}`);
        return;
      }

      const hand = this.getHand(owner);

      const component: InHandComponent = {
        id: dto.id,
        type: dto.type,
        hand: hand,
        index: dto.index,
      };
      hand.cards.push(card);

      return component;
    });
  }

  // private itemRemoved(item: TableItem): void {
  //   throw new Error("Method not implemented.");
  // }

  private cardMovedToHand(msg: CardMovedToHandMessage): void {
    const card = this.table.findItem<Card>(msg.card);
    if (card === undefined) {
      console.warn(`cardMovedToHand ${msg.card} card`);
      return;
    }

    const seat = this.bench.seats.find(s => s.id === msg.owner);
    if (seat === undefined) {
      console.warn(`cardMovedToHand ${msg.owner} seat`);
      return;
    }

    const hand = this.getHand(seat);

    const component: InHandComponent = {
      id: -1,
      type: "InHandComponent",
      hand: hand,
      index: msg.index,
    };
    card.components.push(component);
    hand.cards.push(card);

    this.events.emit("CardMovedToHand", card);
  }

  private cardRemovedFromHand(msg: CardRemovedFromHandMessage): void {
    const card = this.table.findItem<Card>(msg.card);
    if (card === undefined) {
      console.warn(`cardRemovedFromHand ${msg.card}`)
      return;
    }

    const component = findComponentForSure<InHandComponent>(card, "InHandComponent");

    removeItemFromCollection(card.components, component);
    removeItemFromCollection(component.hand.cards, card);

    this.events.emit("CardRemovedFromHand", card, component.hand);
  }

  private cardsSwapped(msg: CardsSwappedMessage): void {

    const card1 = this.table.findItem<Card>(msg.card1);
    if (card1 === undefined) {
      console.warn(`cardsSwapped 1 ${msg.card1}`)
      return;
    }
    const card2 = this.table.findItem<Card>(msg.card2);
    if (card2 === undefined) {
      console.warn(`cardsSwapped 2 ${msg.card2}`)
      return;
    }

    const component1 = findComponent<InHandComponent>(card1, "InHandComponent");
    if (component1 === undefined) {
      console.warn(`cardsSwapped component1 ${card1}`);
      return;
    }
    const component2 = findComponent<InHandComponent>(card2, "InHandComponent");
    if (component2 === undefined) {
      console.warn(`cardsSwapped component2 ${card2}`);
      return;
    }

    const a = component1.index;
    component1.index = component2.index;
    component2.index = a;

    this.events.emit("CardsSwapped", card1, card2);
  }
}
