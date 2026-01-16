import type WiwdowType from "./WiwdowType";

export default interface WiwdowBaseData {
  id: number,
  type: WiwdowType,
  /**
   * px
   */
  x: number,
  /**
   * px
   */
  y: number,
  /**
   * px
   */
  width: number,
  /**
   * px
   */
  height: number,
  canClose: boolean,
  canHide: boolean,
  title: string | undefined,
  hidden: boolean
}
