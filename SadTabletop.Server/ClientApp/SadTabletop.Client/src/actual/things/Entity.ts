import type EntityComponent from "./EntityComponent";

export default interface Entity {
  id: number;
  type: string;
  components: EntityComponent[];
}
