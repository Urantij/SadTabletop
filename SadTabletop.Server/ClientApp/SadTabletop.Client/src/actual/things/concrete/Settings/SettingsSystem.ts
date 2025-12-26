import type TypedEmitter from "@/utilities/TypedEmiiter";
import type Entity from "../../Entity";
import { removeFromCollection } from "@/utilities/MyCollections";
import type CameraBoundSetting from "./Variants/CameraBoundSetting";
import EntitiesSystem from "../../EntitiesSystem";

type SettingsEvents = {
  CameraBoundChanged: (setting: CameraBoundSetting | undefined) => void;
}

export default class SettingsSystem extends EntitiesSystem<Entity> {

  readonly events: TypedEmitter<SettingsEvents> = new Phaser.Events.EventEmitter();

  readonly list: Entity[] = [];

  override isIncludedEntityByType(type: string) {
    return ["CameraBoundSetting"].includes(type);
  }

  override addEntityToList(entity: Entity): void {
    const existing = removeFromCollection(this.list, i => i.type === entity.type);
    this.list.push(entity);
  }

  addSetting(setting: Entity) {
    const existing = removeFromCollection(this.list, i => i.type === setting.type);

    this.list.push(setting);

    this.emit(setting.type, setting);
  }

  removeSetting(id: number, type: string) {
    const setting = removeFromCollection(this.list, e => e.id === id);

    if (setting === undefined) {
      console.warn(`Убирает несуществующую настройку ${id} (${type})`);
      return;
    }

    this.emit(setting.type, undefined);
  }

  findSetting<T extends Entity>(key: string) {
    const value = this.list.find(e => e.type === key);

    if (value === undefined)
      return value;

    return value as T;
  }

  private emit(type: string, setting: Entity | undefined) {
    if (type === "CameraBoundSetting") {
      this.events.emit("CameraBoundChanged", setting as CameraBoundSetting | undefined);
    }
    else {
      console.warn(`Неизвестная настройка ${type}`);
    }
  }
}
