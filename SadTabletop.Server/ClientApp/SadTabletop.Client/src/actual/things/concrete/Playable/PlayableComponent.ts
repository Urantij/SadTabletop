import type EntityComponent from "../../EntityComponent";
import type Seat from "../../Seat";
import type TableItem from "../../TableItem";

export interface PlayableComponent extends EntityComponent {
  owner: Seat;
  targets: TableItem[] | null;
}

export interface PlayableComponentDto extends EntityComponent {
  owner: number;
  targets: number[] | null;
}
