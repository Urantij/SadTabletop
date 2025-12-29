import type TypedEmitter from "@/utilities/TypedEmiiter";
import type Entity from "./Entity";
import { removeFromCollection } from "@/utilities/MyCollections";
import type { un } from "vue-router/dist/router-CWoNjPRp.mjs";

// когда ентити приходит с сервера, у этой ентити могут быть ссылки на другие ентити
// или скорее компоненты, которые ссылаются на другие ентити
// если ентити приходят по одной после синхронизации, всё должно быть в поряде,
// так как вряд ли 1 новая ентити будет ссылаться на ещё не добавленную ентити.
//
// но во время синхронизации ентити и компоненты могут ссылаться на вещи, которые ещё не были добавлены.
// таким образом сначала нужно добавить все ентити в системы.
// затем пройтись по всем ентити и их компонентам и "трансформировать" их -
// переделать айди (ссылки) на ентити на сами ентити
//
// таким образом есть два способа добавить ентити в систему - попроще и посложнее.
// при попроще ентити кладут, она трансформируется, и идёт ивент о добавлении
// при посложнее все ентити также кладут, но без трансформации и ивента.
// затем все ентити трансформируются, затем все ентити ивентируются
//
// если я окажусь в ситуации, что новые ентити добавляют пачкой, и они ссылаются друг на друга,
// можно будет добавить новое сообщение на добавление пачки ентити
// но пока что мне похуй

export type EntitiesEvents<T extends Entity> = {
  EntityAddedEarly: (entity: T) => void;
  EntityAdded: (entity: T, data: object | null) => void;
  EntityRemoved: (entity: T, data: object | null) => void;
}

export abstract class EntitiesBaseSystem {
  abstract isIncludedEntityByType(type: string): boolean;

  /**
   * Добавить ентити, но не делать анонсы
   * @param entity
   */
  abstract addComplexStage1(entity: Entity): void;

  /**
   * Сделать ирли анонс ентити
   * @param entity
   */
  abstract addComplexStage2(entity: Entity): void;

  /**
   * Сделать основной анонс ентити
   * @param entity
   */
  abstract addComplexStage3(entity: Entity, data: object | null): void;

  abstract addSimple(entity: Entity, data: object | null): void;

  abstract remove(id: number): void;

  abstract clear(): void;
}

export default abstract class EntitiesSystem<TEntity extends Entity> extends EntitiesBaseSystem {

  readonly events: TypedEmitter<EntitiesEvents<TEntity>> = new Phaser.Events.EventEmitter();

  readonly entities: TEntity[] = [];

  // я плохо себя чувствую и поэтому не буду делать добавить убрать найти

  override addComplexStage1(entity: TEntity) {
    this.addEntityToList(entity);
  }

  override addComplexStage2(entity: TEntity) {
    this.events.emit("EntityAddedEarly", entity);
  }

  override addComplexStage3(entity: TEntity, data: object | null = null) {
    this.events.emit("EntityAdded", entity, data);
  }

  override addSimple(entity: TEntity, data: object | null = null) {
    this.addEntityToList(entity);
    this.events.emit("EntityAddedEarly", entity);
    this.events.emit("EntityAdded", entity, data);
  }

  override remove(id: number, data: object | null = null): void {
    const entity = removeFromCollection(this.entities, i => i.id === id);
    if (entity === undefined) {
      console.log(`удаляем неизвестный ентити ${id}`);
      return;
    }

    this.events.emit("EntityRemoved", entity, data);
  }

  override clear(): void {
    this.entities.splice(0);
  }

  protected addEntityToList(entity: TEntity) {
    this.entities.push(entity);
  }

  get(id: number) {
    const item = this.entities.find(s => s.id === id);

    if (item === undefined) {
      throw new Error(`не удалось найти сущность ${id}`);
    }

    return item;
  }

  getCast<T extends TEntity>(id: number) {
    return this.get(id) as undefined | T;
  }

  find(id: number) {
    const res = this.entities.find(i => i.id === id);

    if (res === undefined)
      return res;

    return res;
  }

  findCast<T extends TEntity>(id: number) {
    return this.find(id) as undefined | T;
  }
}
