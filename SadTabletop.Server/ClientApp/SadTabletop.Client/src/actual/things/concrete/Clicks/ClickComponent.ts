import type EntityComponent from "../../EntityComponent";

export default interface ClickComponent extends EntityComponent {
  singleUse: boolean;
}
