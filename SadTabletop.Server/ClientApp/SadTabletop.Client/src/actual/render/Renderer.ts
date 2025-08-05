import type TypedEmitter from "@/utilities/TypedEmiiter";
import type LeGame from "../LeGame";
import MainScene from "./MainScene";
import Phaser from "phaser";
import type Entity from "../things/Entity";
import type Card from "../things/concrete/Card";

type MessageEvents = {
    test: () => void;
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

                    this.leGame.table.events.on("EntityAdded", (entity) => {
                        this.createEntity(entity);
                    });
                  this.leGame.table.events.on("EntityRemoved", (entity) => {
                    this.scene?.destroyEntity(entity);
                  });

                    for (const entity of this.leGame.table.items) {
                        this.createEntity(entity);
                    }

                    resolve(null);
                });

                game.scene.start(this.scene, this.leGame);
            });
        });
    }

    private createEntity(entity: Entity) {
        if (this.scene === null) {
            return;
        }

        if (entity.type === "Card") {
            const card = entity as Card;

            this.scene.createCard(card);
        }
        else if (entity.type === "Deck") {

        }
        else if (entity.type === "Dice") {

        }
        else {
            console.log(`Непонятная ентити в мире ${entity.type}`);
        }
    }
}
