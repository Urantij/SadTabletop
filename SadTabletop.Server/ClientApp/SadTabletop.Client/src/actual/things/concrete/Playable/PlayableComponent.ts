import type EntityComponent from "../../EntityComponent";
import type Seat from "../../Seat";
import type TableItem from "../Table/TableItem";

export interface PlayableComponent extends EntityComponent {
  owner: Seat;
  targets: TableItem[] | null;
}

export interface PlayableComponentDto extends EntityComponent {
  owner: number;
  targets: number[] | null;
}
