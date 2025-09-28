import type EntityComponent from "../../EntityComponent";
import type Hand from "./Hand";

export interface InHandComponentDto extends EntityComponent {
  owner: number;
  index: number;
}

export interface InHandComponent extends EntityComponent {
  hand: Hand;
  index: number;
}
