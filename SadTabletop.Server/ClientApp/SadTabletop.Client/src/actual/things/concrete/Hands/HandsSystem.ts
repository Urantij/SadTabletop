import type Table from "@/actual/things/concrete/Table/Table";
import type Connection from "@/communication/Connection";
import type TypedEmitter from "@/utilities/TypedEmiiter";
import type CardMovedToHandMessage from "./messages/server/CardMovedToHandMessage";
import type CardRemovedFromHandMessage from "./messages/server/CardRemovedFromHandMessage";
import type CardsSwappedMessage from "./messages/server/CardsSwappedMessage";
import type TableItem from "../Table/TableItem";
import type Card from "../Cards/Card";
import type Bench from "@/actual/Bench";
import type { InHandComponent, InHandComponentDto } from "./InHandComponent";
import { findComponent, findComponentForSure, replaceDtoComponent } from "@/utilities/Componenter";
import { removeItemFromCollection } from "@/utilities/MyCollections";
import Hand from "./Hand";
import type Seat from "../../Seat";
import type MoveCardInHandMessage from "./messages/client/MoveCardInHandMessage";
import type CardMovedInHandMessage from "./messages/server/CardMovedInHandMessage";

type HandsEvents = {
  CardMovedToHand: (card: Card, component: InHandComponent) => void;
  CardRemovedFromHand: (card: Card, hand: Hand) => void;
  CardsSwapped: (card1: Card, card2: Card) => void;
  CardMovedInHand: (card: Card, component: InHandComponent) => void;
}

export default class HandsSystem {

  readonly table: Table;
  readonly bench: Bench;

  // TODO если так подумать, раз я стираю ситы, хенды тоже нужно стирать, но у меня хенды как референсы много где юзаются
  // pizda)
  readonly hands: Hand[] = [];

  readonly events: TypedEmitter<HandsEvents> = new Phaser.Events.EventEmitter();

  connection: Connection | null = null;

  constructor(table: Table, bench: Bench) {
    this.table = table;
    this.bench = bench;

    this.table.events.on("EntityAdded", (item) => this.itemAdded(item));
    this.table.events.on("EntityRemoved", (item) => this.itemRemoved(item));
  }

  subscribeToConnection(connection: Connection) {
    this.connection = connection;
    connection.registerForMessage<CardMovedToHandMessage>("CardMovedToHandMessage", msg => this.cardMovedToHand(msg));
    connection.registerForMessage<CardRemovedFromHandMessage>("CardRemovedFromHandMessage", msg => this.cardRemovedFromHand(msg));
    connection.registerForMessage<CardsSwappedMessage>("CardsSwappedMessage", msg => this.cardsSwapped(msg));
    connection.registerForMessage<CardMovedInHandMessage>("CardMovedInHandMessage", msg => this.cardMovedInHand(msg));
  }

  moveCard(card: Card, index: number) {
    // TODO проверки наверное нужны?
    const message: MoveCardInHandMessage = {
      card: card.id,
      index: index
    };

    this.connection?.sendMessage("MoveCardInHandMessage", message);
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

    const component = replaceDtoComponent(item, "InHandComponent", (dto: InHandComponentDto) => {

      const owner = this.bench.entities.find(s => s.id === dto.owner);
      if (owner === undefined) {
        console.error(`itemAdded owner ${dto.owner}`);
        return;
      }

      const hand = this.getHand(owner);

      const component: InHandComponent = {
        id: dto.id,
        type: dto.type,
        hand: hand,
        index: dto.index,
      };

      return component;
    });

    if (component === undefined)
      return;

    // TODO господь помоги мне
    component.hand.cards.push(card);
    component.hand.cards.sort((a, b) => {
      const ca = findComponentForSure<InHandComponent>(a, "InHandComponent");
      const cb = findComponentForSure<InHandComponent>(b, "InHandComponent");

      return ca.index - cb.index;
    });
  }

  private itemRemoved(item: TableItem): void {
    if (item.type !== "Card")
      return;

    const card = item as Card;

    const component = findComponent<InHandComponent>(card, "InHandComponent");
    if (component === undefined)
      return;

    removeItemFromCollection(component.hand.cards, card);

    this.updateIndexesLikeStupid(component.hand);
  }

  // private itemRemoved(item: TableItem): void {
  //   throw new Error("Method not implemented.");
  // }

  private cardMovedToHand(msg: CardMovedToHandMessage): void {

    const card = this.table.findCast<Card>(msg.card);
    if (card === undefined) {
      console.warn(`cardMovedToHand ${msg.card} card`);
      return;
    }

    const seat = this.bench.entities.find(s => s.id === msg.owner);
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
    // TODO господь помоги мне
    hand.cards.push(card);
    hand.cards.sort((a, b) => {
      const ca = findComponentForSure<InHandComponent>(a, "InHandComponent");
      const cb = findComponentForSure<InHandComponent>(b, "InHandComponent");

      return ca.index - cb.index;
    });

    this.updateIndexesLikeStupid(hand);

    this.events.emit("CardMovedToHand", card, component);
  }

  private cardRemovedFromHand(msg: CardRemovedFromHandMessage): void {
    const card = this.table.findCast<Card>(msg.card);
    if (card === undefined) {
      console.warn(`cardRemovedFromHand ${msg.card}`)
      return;
    }

    const component = findComponentForSure<InHandComponent>(card, "InHandComponent");

    removeItemFromCollection(card.components, component);
    removeItemFromCollection(component.hand.cards, card);

    this.updateIndexesLikeStupid(component.hand);

    this.events.emit("CardRemovedFromHand", card, component.hand);
  }

  private cardsSwapped(msg: CardsSwappedMessage): void {

    const card1 = this.table.findCast<Card>(msg.card1);
    if (card1 === undefined) {
      console.warn(`cardsSwapped 1 ${msg.card1}`)
      return;
    }
    const card2 = this.table.findCast<Card>(msg.card2);
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

  private cardMovedInHand(msg: CardMovedInHandMessage): void {

    const card = this.table.findCast<Card>(msg.card);
    if (card === undefined) {
      console.warn(`cardMovedInHand card ${msg.card}`)
      return;
    }

    const component = findComponent<InHandComponent>(card, "InHandComponent");
    if (component === undefined) {
      console.warn(`cardMovedInHand component ${card}`);
      return;
    }

    component.hand.cards.splice(component.index, 1);
    component.hand.cards.splice(msg.index, 0, card);

    this.updateIndexesLikeStupid(component.hand);

    this.events.emit("CardMovedInHand", card, component);
  }

  // TODO нормально сделать
  private updateIndexesLikeStupid(hand: Hand) {
    for (let index = 0; index < hand.cards.length; index++) {
      const element = hand.cards[index];
      findComponentForSure<InHandComponent>(element, "InHandComponent").index = index;
    }
  }
}
