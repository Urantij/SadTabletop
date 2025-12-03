import type CardRenderInfo from "./CardRenderInfo";

export default interface CardFaceComplicated {
  side: number;
  renderInfos: CardRenderInfo[] | null;
}
