import type WiwdowType from "./WiwdowType";

export default interface WiwdowBaseData {
  id: number,
  type: WiwdowType,
  x: string,
  y: string,
  width: string,
  height: string,
  canClose: boolean,
  canHide: boolean,
  title: string | undefined,
  hidden: boolean
}
