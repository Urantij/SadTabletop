import type TypedEmitter from "@/utilities/TypedEmiiter";
import type LeGame from "../LeGame";
import MainScene, { cursorMovedInTheWorldName } from "./MainScene";
import Phaser from "phaser";
import type Entity from "../things/Entity";
import type TextItem from "../things/concrete/TextItem";
import type Deck from "@/actual/things/concrete/Decks/Deck";
import type Card from "../things/concrete/Cards/Card";
import type RenderObjectRepresentation from "./RenderObjectRepresentation";
import type RectShape from "../things/concrete/Shapes/RectShape";
import type CircleShape from "../things/concrete/Shapes/CircleShape";
import type MySprite from "../things/concrete/Sprites/MySprite";
import type MyTileSprite from "../things/concrete/Sprites/MyTileSprite";
import type TableItem from "../things/concrete/Table/TableItem";
import DeckCardInsertedData from "../things/concrete/Decks/DeckCardInsertedData";
import DeckCardRemovedData from "../things/concrete/Decks/DeckCardRemovedData";
import type Dice from "../things/concrete/Dices/Dice";

type RendererEvents = {
  ClickyClicked: (entity: TableItem) => void;
  CursorMoved: (pos: Phaser.Math.Vector2) => void;
}

export class DepthChart {

  public static Shapes = -1;

  public static Default = 0;

  public static Text: 3;

  public static Card = 10;

  public static Cursor = 15;
}

export default class Renderer {

  readonly leGame: LeGame;

  readonly config: Phaser.Types.Core.GameConfig;

  readonly events: TypedEmitter<RendererEvents> = new Phaser.Events.EventEmitter();

  game: Phaser.Game | null = null;
  scene: MainScene | null = null;

  constructor(leGame: LeGame, width: number, height: number, parent: string) {

    this.leGame = leGame;

    this.config = {
      parent: parent,
      type: Phaser.AUTO,
      width: width,
      height: height,
      input: {
        keyboard: true
      }
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
          this.scene?.events.on(cursorMovedInTheWorldName, (pos: Phaser.Math.Vector2) => {
            this.events.emit("CursorMoved", pos);
          });

          this.leGame.table.events.on("EntityAdded", (item, data) => {
            if (data instanceof DeckCardRemovedData) {
              this.scene?.removeCardFromDeck(item as Card, data);
            }
            else {
              this.createEntity(item, data);
            }
          });
          this.leGame.table.events.on("EntityRemoved", (item, data) => {
            if (data instanceof DeckCardInsertedData) {
              this.scene?.insertCardToDeck(item as Card, data);
            }
            else {
              this.scene?.destroyEntity(item);
            }
          });
          this.leGame.table.events.on("ItemMoved", (item, oldX, oldY) => {
            this.scene?.moveItem(item);
          });
          this.leGame.events.on("Clearing", () => {
            this.scene?.clearItems();
          });

          this.leGame.table.cards.events.on("CardFlipped", (card) => {
            this.scene?.flipCard(card);
          });

          this.leGame.table.decks.events.on("DeckUpdated", (deck) => {
            this.scene?.updateDeck(deck);
          });
          // this.leGame.table.decks.events.on("CardInserted", (deck, card) => {
          //   this.scene?.insertCardToDeck(deck, card);
          // });
          // this.leGame.table.decks.events.on("CardRemoved", (deck, card) => {
          //   this.scene?.removeCardFromDeck(deck, card);
          // });

          this.leGame.table.dices.events.on("DiceChanged", (dice) => {
            this.scene?.updateDice(dice);
          });
          this.leGame.table.dices.events.on("DiceRolled", (dice) => {
            this.scene?.rollDice(dice);
          });

          this.leGame.table.clicks.events.on("ItemClickyChanged", (item, clicky) => {
            this.scene?.updateClicky(item, clicky);
          });

          this.leGame.playersContainer.events.on("PlayerAdded", (player) => {
            this.scene?.createCursor(player);
          });
          this.leGame.playersContainer.events.on("PlayerRemoved", (player) => {
            this.scene?.destroyEntity(player.cursor);
          });

          this.leGame.events.on("PreDataSet", () => {
            for (const player of this.leGame.playersContainer.players) {
              if (player === this.leGame.ourPlayer)
                continue;

              this.scene?.createCursor(player);
            }
          });

          // уэуэуэу
          for (const player of this.leGame.playersContainer.players) {
            if (player === this.leGame.ourPlayer)
              continue;

            this.scene?.createCursor(player);
          }

          for (const entity of this.leGame.table.entities) {
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
      this.scene.createDice(entity as Dice);
    }
    else if (entity.type === "TextItem") {
      this.scene.createText(entity as TextItem)
    }
    else if (entity.type === "RectShape") {
      this.scene.createRectShape(entity as RectShape)
    }
    else if (entity.type === "CircleShape") {
      this.scene.createCircleShape(entity as CircleShape)
    }
    else if (entity.type === "MySprite") {
      this.scene.createMySprite(entity as MySprite)
    }
    else if (entity.type === "MyTileSprite") {
      this.scene.createMyTileSprite(entity as MyTileSprite)
    }
    else {
      console.log(`Непонятная ентити в мире ${entity.type}`);
    }
  }
}
