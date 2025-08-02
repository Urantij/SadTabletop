import type TypedEmitter from "@/utilities/TypedEmiiter";
import type Entity from "./things/Entity";

type MessageEvents = {
    EntityAdded: (entity: Entity) => void;
}

/**
 * Хранит объекты на столе
 */
export default class Table {
    readonly items: Entity[] = [];

    readonly events: TypedEmitter<MessageEvents> = new Phaser.Events.EventEmitter();

    addEntity(entity: Entity) {

        console.log(`в стол добавлена ентити ${entity.type} ${entity.id}`);

        this.items.push(entity);

        this.events.emit("EntityAdded", entity);
    }
}