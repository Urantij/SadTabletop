import type EntityComponent from "../../EntityComponent";
import type TableItem from "../../TableItem";

export interface DraggerComponentDto extends EntityComponent {
  item: number | null;
}

export interface DraggerComponent extends EntityComponent {
  item: TableItem | null;
}
