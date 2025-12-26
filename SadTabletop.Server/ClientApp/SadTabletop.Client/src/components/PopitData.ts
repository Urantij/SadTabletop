import type PopitOption from "./PopitOption";
import type WiwdowBaseData from "./Wiwdow/WiwdowBaseData";

export default interface PopitData extends WiwdowBaseData {
  options: PopitOption[];

  finished: boolean;
}
