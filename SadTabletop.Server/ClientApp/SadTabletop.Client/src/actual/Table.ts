import type TypedEmitter from "@/utilities/TypedEmiiter";
import type Entity from "./things/Entity";
import {removeFromCollection} from "@/utilities/MyCollections";

type MessageEvents = {
  EntityAdded: (entity: Entity) => void;
  EntityRemoved: (entity: Entity) => void;
}

/**
 * Хранит объекты на столе
 */
export default class Table {
  readonly items: Entity[] = [];

  readonly events: TypedEmitter<MessageEvents> = new Phaser.Events.EventEmitter();

  isTableEntityByType(type: string) {
    return ["Card", "Dice", "Deck"].includes(type);
  }

  addEntity(entity: Entity) {

    console.log(`в стол добавлена ентити ${entity.type} ${entity.id}`);

    this.items.push(entity);

    this.events.emit("EntityAdded", entity);
  }

  removeEntity(id: number) {
    const entity = removeFromCollection(this.items, i => i.id === id);
    if (entity === undefined) {
      console.log(`table удаляем неизвестный ентити ${id}`);
      return;
    }

    this.events.emit("EntityRemoved", entity);
  }
}
