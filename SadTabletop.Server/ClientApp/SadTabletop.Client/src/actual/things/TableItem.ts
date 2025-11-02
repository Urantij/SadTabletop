import type Entity from "./Entity";

export default interface TableItem extends Entity {
  x: number;
  y: number;
  description: string | null;
}
