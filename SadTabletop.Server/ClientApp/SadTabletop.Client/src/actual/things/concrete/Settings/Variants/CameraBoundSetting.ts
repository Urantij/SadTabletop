import type Entity from "@/actual/things/Entity";

export default interface CameraBoundSetting extends Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}
