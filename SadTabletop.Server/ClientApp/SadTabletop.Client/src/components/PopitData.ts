import type PopitOption from "./PopitOption";

export default interface PopitData {
  title: string;
  options: PopitOption[];
  finished: boolean;

  canHide: boolean;
  canClose: boolean;
}
