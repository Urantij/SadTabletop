import type RenderObjectRepresentation from "@/actual/render/RenderObjectRepresentation";
import type Entity from "../../Entity";

export default interface TableItem extends Entity {
  x: number;
  y: number;
  description: string | null;

  /**
   * TODO не везде есть, скорее нигде нет
   */
  render: RenderObjectRepresentation | undefined;
}
