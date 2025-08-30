import type TypedEmitter from "@/utilities/TypedEmiiter";
import type LeGame from "../LeGame";
import MainScene from "./MainScene";
import Phaser from "phaser";
import type Entity from "../things/Entity";
import type TextItem from "../things/concrete/TextItem";
import type Deck from "@/actual/things/concrete/Decks/Deck";
import type Card from "../things/concrete/Cards/Card";
import type RenderObjectRepresentation from "./RenderObjectRepresentation";
import type TableItem from "../things/TableItem";

type MessageEvents = {
  ClickyClicked: (entity: TableItem) => void;
}

export default class Renderer {

  readonly leGame: LeGame;

  readonly config: Phaser.Types.Core.GameConfig;

  readonly events: TypedEmitter<MessageEvents> = new Phaser.Events.EventEmitter();

  game: Phaser.Game | null = null;
  scene: MainScene | null = null;

  constructor(leGame: LeGame, width: number, height: number, parent: string) {

    this.leGame = leGame;

    this.config = {
      parent: parent,
      type: Phaser.AUTO,
      width: width,
      height: height,
      // plugins: {
      //     global: [
      //     ]
      // }
    };
  }

  public async initAsync() {

    console.log(`инитим фазер...`);

    return new Promise((resolve) => {

      const game = new Phaser.Game(this.config);

      this.game = game;

      this.game.events.once("ready", () => {

        console.log("game ready");

        game.input.mouse?.disableContextMenu();

        this.scene = game.scene.add("Main", MainScene, false) as MainScene;
        this.scene.events.once("READY)))", () => {

          console.log("scene ready");

          this.scene?.cameras.main.centerOn(0, 0);

          this.scene?.events.on("ClickyClicked", (container: RenderObjectRepresentation) => {
            this.events.emit("ClickyClicked", container.gameObject);
          });

          this.leGame.table.events.on("ItemAdded", (item, data) => {
            this.createEntity(item, data);
          });
          this.leGame.table.events.on("ItemRemoved", (item) => {
            this.scene?.destroyEntity(item);
          });
          this.leGame.table.events.on("ItemMoved", (item, oldX, oldY) => {
            this.scene?.moveItem(item, oldX, oldY);
          });
          this.leGame.table.events.on("Clearing", () => {
            this.scene?.clearItems();
          });

          this.leGame.table.cards.events.on("CardFlipped", (card) => {
            this.scene?.flipCard(card);
          });

          this.leGame.table.decks.events.on("DeckUpdated", (deck) => {
            this.scene?.updateDeck(deck);
          });
          this.leGame.table.decks.events.on("CardInserted", (deck, card) => {
            this.scene?.insertCardToDeck(deck, card);
          });
          this.leGame.table.decks.events.on("CardRemoved", (deck, card) => {
            this.scene?.removeCardFromDeck(deck, card);
          });

          this.leGame.table.clicks.events.on("ItemClickyChanged", (item, clicky) => {
            this.scene?.updateClicky(item, clicky);
          });

          for (const entity of this.leGame.table.items) {
            this.createEntity(entity, null);
          }

          resolve(null);
        });

        game.scene.start(this.scene, this.leGame);
      });
    });
  }

  private createEntity(entity: Entity, data: object | null) {
    if (this.scene === null) {
      return;
    }

    if (entity.type === "Card") {
      const card = entity as Card;

      this.scene.createCard(card, data);
    }
    else if (entity.type === "Deck") {
      this.scene.createDeck(entity as Deck);
    }
    else if (entity.type === "Dice") {
    }
    else if (entity.type === "TextItem") {
      this.scene.createText(entity as TextItem)
    }
    else {
      console.log(`Непонятная ентити в мире ${entity.type}`);
    }
  }
}
