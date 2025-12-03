import type TypedEmitter from "@/utilities/TypedEmiiter";
import type Connection from "@/communication/Connection";
import type DeckCardInsertedMessage from "./messages/server/DeckCardInsertedMessage";
import type DeckCardRemovedMessage from "./messages/server/DeckCardRemovedMessage";
import type DeckUpdatedMessage from "./messages/server/DeckUpdatedMessage";
import type Table from "@/actual/Table";
import type Deck from "./Deck";
import type Card from "../Cards/Card";
import type DeckCardInfo from "./DeckCardInfo";
import DeckCardRemovedData from "./DeckCardRemovedData";
import type TableItem from "../../TableItem";
import { CardFaceUncomplicate, FixDeckCard, sameCardFace } from "../Cards/CardCompareHelper";

type DeckEvents = {
  DeckUpdated: (deck: Deck) => void;
  CardInserted: (deck: Deck, card: Card) => void;
  CardRemoved: (deck: Deck, card: Card) => void;
}

export default class DecksSystem {

  readonly table: Table;

  readonly events: TypedEmitter<DeckEvents> = new Phaser.Events.EventEmitter();

  constructor(table: Table) {
    this.table = table;
  }

  subscribeToConnection(connection: Connection) {
    connection.registerForMessage<DeckUpdatedMessage>("DeckUpdatedMessage", msg => this.deckUpdated(msg));
    connection.registerForMessage<DeckCardInsertedMessage>("DeckCardInsertedMessage", msg => this.deckCardInserted(msg));
    connection.registerForMessage<DeckCardRemovedMessage>("DeckCardRemovedMessage", msg => this.deckCardRemoved(msg))

    this.table.events.on("ItemAddedEarly", this.earlyItemAdded, this);
  }

  private deckUpdated(msg: DeckUpdatedMessage): void {
    const deck = this.table.items.find(i => i.id === msg.deck) as Deck;
    if (deck === undefined) {
      console.warn(`При попытке deckUpdated ентити не был найден. ${msg.deck}`);
      return;
    }

    if (msg.cards !== null)
      for (const element of msg.cards) {
        FixDeckCard(element);
      }

    deck.side = CardFaceUncomplicate(msg.side);
    deck.cardsCount = msg.cardsCount;
    deck.cards = msg.cards;

    this.events.emit("DeckUpdated", deck);
  }

  private deckCardInserted(msg: DeckCardInsertedMessage): void {
    const deck = this.table.items.find(i => i.id === msg.deck) as Deck;
    if (deck === undefined) {
      console.warn(`При попытке deckCardInserted deck ентити не был найден. ${msg.deck}`);
      return;
    }

    const card = this.table.items.find(i => i.id === msg.card) as Card;
    if (card === undefined) {
      console.warn(`При попытке deckCardInserted card ентити не был найден. ${msg.card}`);
      return;
    }

    deck.cardsCount++;

    msg.side = CardFaceUncomplicate(msg.side);
    msg.cardFront = CardFaceUncomplicate(msg.cardFront);

    if (msg.side !== null) {
      deck.side = msg.side;
    }

    if (msg.cardFront !== null) {
      card.frontSide = msg.cardFront;
    }

    if (msg.deckIndex !== null) {
      const cardInfo: DeckCardInfo = {
        front: card.frontSide!,
        back: card.backSide
      };
      deck.cards!.splice(msg.deckIndex, 0, cardInfo);
    }
    else if (deck.cards !== null) {
      const cardInfo: DeckCardInfo = {
        front: card.frontSide!,
        back: card.backSide
      };
      deck.cards.push(cardInfo);
    }

    this.events.emit("CardInserted", deck, card);
  }

  private deckCardRemoved(msg: DeckCardRemovedMessage): void {
    const deck = this.table.items.find(i => i.id === msg.deck) as Deck;
    if (deck === undefined) {
      console.warn(`При попытке deckCardInserted deck ентити не был найден. ${msg.deck}`);
      return;
    }

    deck.cardsCount--;

    msg.card.frontSide = CardFaceUncomplicate(msg.card.frontSide);
    msg.side = CardFaceUncomplicate(msg.side);
    msg.cardFront = CardFaceUncomplicate(msg.cardFront);

    if (msg.cardIndex !== null) {
      deck.cards!.splice(msg.cardIndex, 1);
    }
    else if (deck.cards !== null) {

      const cardFront = msg.card.frontSide ?? msg.cardFront;

      if (cardFront != null) {
        const infoIndex = deck.cards.findIndex(deckCard =>
          sameCardFace(deckCard.front, cardFront) &&
          sameCardFace(deckCard.back, msg.card.backSide));

        if (infoIndex === -1) {
          throw new Error("не нашлась карта в колоде при попытке её достать");
        }

        deck.cards.splice(infoIndex, 1);
      }
      else {
        console.warn(`Нет возможности определить карту для удаление в деке.`);
      }
    }

    const data = new DeckCardRemovedData(deck);

    this.table.addItem(msg.card, data);

    this.events.emit("CardRemoved", deck, msg.card);
  }

  private earlyItemAdded(item: TableItem) {
    if (item.type !== "Deck")
      return;

    const deck = item as Deck;

    if (typeof deck.side === "number") {
      deck.side = {
        side: deck.side,
        renderInfos: null
      };
    }

    if (deck.cards !== null) {

      for (const element of deck.cards) {
        FixDeckCard(element);
      }
    }
  }
}
