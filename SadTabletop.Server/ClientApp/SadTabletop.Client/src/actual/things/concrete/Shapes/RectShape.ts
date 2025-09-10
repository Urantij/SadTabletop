import type { SomeShape } from "./SomeShape";

export default interface RectShape extends SomeShape {
  width: number;
  height: number;
  color: number;
}
