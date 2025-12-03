import type CardRenderInfo from "../CardRenderInfo";

export default interface CardTextRender extends CardRenderInfo {
  text: string;
  color: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
}
