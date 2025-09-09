import type EntityComponent from "../../EntityComponent";

export default interface HandOverrideComponent extends EntityComponent {
  x: number | null;
  y: number | null;
  rotation: number | null;
}
