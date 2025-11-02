import type EntityComponent from "../../EntityComponent";

export default interface HintComponent extends EntityComponent {
  hint: string | null;
}
