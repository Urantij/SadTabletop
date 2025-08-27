import type ClickComponent from "@/actual/things/concrete/Clicks/ClickComponent";
import type Entity from "@/actual/things/Entity";
import type TableItem from "@/actual/things/TableItem";

export function findComponent(entity: Entity, type: string) {
  return entity.components.find(c => c.type === type);
}

export function findClicky(entity: Entity) {
  return findComponent(entity, "ClickComponent") as ClickComponent | undefined;
}

export function isClicky(item: TableItem) {
  return findClicky(item) !== undefined;
}
