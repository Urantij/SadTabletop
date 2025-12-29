import type TypedEmitter from "@/utilities/TypedEmiiter";
import type Connection from "@/communication/Connection";
import type DeckCardInsertedMessage from "./messages/server/DeckCardInsertedMessage";
import type DeckCardRemovedMessage from "./messages/server/DeckCardRemovedMessage";
import type DeckUpdatedMessage from "./messages/server/DeckUpdatedMessage";
import type Table from "@/actual/things/concrete/Table/Table";
import type Deck from "./Deck";
import type Card from "../Cards/Card";
import type DeckCardInfo from "./DeckCardInfo";
import DeckCardRemovedData from "./DeckCardRemovedData";
import type TableItem from "../Table/TableItem";
import { CardFaceUncomplicate, FixDeckCard, sameCardFace } from "../Cards/CardCompareHelper";
import { removeFromCollection } from "@/utilities/MyCollections";
import DeckCardInsertedData from "./DeckCardInsertedData";

type DeckEvents = {
  DeckUpdated: (deck: Deck) => void;
  // CardInserted: (deck: Deck, card: Card) => void;
  // CardRemoved: (deck: Deck, card: Card) => void;
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

    this.table.events.on("EntityAddedEarly", this.earlyItemAdded, this);
  }

  private deckUpdated(msg: DeckUpdatedMessage): void {
    const deck = this.table.entities.find(i => i.id === msg.deck) as Deck;
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
    const deck = this.table.entities.find(i => i.id === msg.deck) as Deck;
    if (deck === undefined) {
      console.warn(`При попытке deckCardInserted deck ентити не был найден. ${msg.deck}`);
      return;
    }

    const card = this.table.entities.find(i => i.id === msg.card) as Card;
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
      card.front = msg.cardFront;
    }

    if (msg.deckIndex !== null) {
      const cardInfo: DeckCardInfo = {
        id: msg.cardDeckId,
        front: card.front!,
        back: card.back
      };
      deck.cards!.splice(msg.deckIndex, 0, cardInfo);
    }
    else if (deck.cards !== null) {
      const cardInfo: DeckCardInfo = {
        id: msg.cardDeckId,
        front: card.front!,
        back: card.back
      };
      deck.cards.push(cardInfo);
    }

    const data = new DeckCardInsertedData(deck);

    // TODO сделать ремув с аргументом инсертед?
    // this.events.emit("CardInserted", deck, card);

    this.table.remove(card.id, data);
  }

  private deckCardRemoved(msg: DeckCardRemovedMessage): void {
    const deck = this.table.entities.find(i => i.id === msg.deck) as Deck;
    if (deck === undefined) {
      console.warn(`При попытке deckCardInserted deck ентити не был найден. ${msg.deck}`);
      return;
    }

    deck.cardsCount--;

    msg.card.front = CardFaceUncomplicate(msg.card.front);
    msg.side = CardFaceUncomplicate(msg.side);

    if (deck.cards !== null) {
      if (msg.cardDeckId !== null) {

        const removed = removeFromCollection(deck.cards, c => c.id === msg.cardDeckId);
        if (removed === undefined) {
          throw new Error("не нашлась карта в колоде при попытке её достать");
        }
      }
      else {
        console.warn(`Нет возможности определить карту для удаление в деке.`);
      }
    }

    deck.side = msg.side;

    const data = new DeckCardRemovedData(deck);

    this.table.addSimple(msg.card, data);

    // this.events.emit("CardRemoved", deck, msg.card);
  }

  private earlyItemAdded(item: TableItem) {
    if (item.type !== "Deck")
      return;

    const deck = item as Deck;

    deck.side = CardFaceUncomplicate(deck.side);

    if (deck.cards !== null) {
      for (const element of deck.cards) {
        FixDeckCard(element);
      }
    }
  }
}
