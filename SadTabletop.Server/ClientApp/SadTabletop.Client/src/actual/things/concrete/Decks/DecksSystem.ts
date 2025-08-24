import type Connection from "@/communication/Connection";
import type DeckCardInsertedMessage from "./messages/server/DeckCardInsertedMessage";
import type DeckCardRemovedMessage from "./messages/server/DeckCardRemovedMessage";
import type DeckUpdatedMessage from "./messages/server/DeckUpdatedMessage";
import type Table from "@/actual/Table";

export default class DecksSystem {

  readonly table: Table;

  constructor(table: Table) {
    this.table = table;
  }

  subscribeToConnection(connection: Connection) {
    connection.registerForMessage<DeckUpdatedMessage>("DeckUpdatedMessage", msg => this.deckUpdated(msg));
    connection.registerForMessage<DeckCardInsertedMessage>("DeckCardInsertedMessage", msg => this.deckCardInserted(msg));
    connection.registerForMessage<DeckCardRemovedMessage>("DeckCardRemovedMessage", msg => this.deckCardRemoved(msg))
  }

  private deckUpdated(msg: DeckUpdatedMessage): void {
    throw new Error("Method not implemented.");
  }

  private deckCardInserted(msg: DeckCardInsertedMessage): void {
    throw new Error("Method not implemented.");
  }

  private deckCardRemoved(msg: DeckCardRemovedMessage): void {
    throw new Error("Method not implemented.");
  }
}
