import type PopitOption from "./PopitOption";

export default interface PopitData {
  title: string;
  options: PopitOption[];
  canHide: boolean;
  canClose: boolean;

  finished: boolean;
}
