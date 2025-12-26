import type ClickComponent from "@/actual/things/concrete/Clicks/ClickComponent";
import type TableItem from "@/actual/things/concrete/Table/TableItem";
import type Entity from "@/actual/things/Entity";
import type EntityComponent from "@/actual/things/EntityComponent";

export function findComponent<T extends EntityComponent>(entity: Entity, type: string) {
  const component = entity.components.find(c => c.type === type);

  if (component === undefined)
    return;

  return component as T;
}

export function findComponentForSure<T extends EntityComponent>(entity: Entity, type: string) {
  const component = entity.components.find(c => c.type === type);

  if (component === undefined)
    throw new Error(`При попытке достать компонент он не нашёлся ${entity} ${type}`);

  return component as T;
}

export function findClicky(entity: Entity) {
  return findComponent(entity, "ClickComponent") as ClickComponent | undefined;
}

export function isClicky(item: TableItem) {
  return findClicky(item) !== undefined;
}

export function replaceDtoComponent<DtoType extends EntityComponent, ResultType extends EntityComponent>(entity: Entity, type: string, func: (dto: DtoType) => ResultType | undefined) {

  // TODO ошибки кидать?

  const index = entity.components.findIndex(c => c.type === type);
  if (index === -1)
    return;

  const dto = entity.components[index] as DtoType;

  const result = func(dto);

  if (result === undefined)
    return;

  entity.components.splice(index, 1, result);

  return result;
}
