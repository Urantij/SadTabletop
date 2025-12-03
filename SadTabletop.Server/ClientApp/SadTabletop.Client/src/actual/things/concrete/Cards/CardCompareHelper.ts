import type DeckCardInfo from "../Decks/DeckCardInfo";
import type CardFaceComplicated from "./CardFaceComplicated";
import type CardRenderInfo from "./CardRenderInfo";
import type CardTextRender from "./render/CardTextRender";

export function CardFaceUncomplicateForSure(face: CardFaceComplicated | number): CardFaceComplicated {
  if (typeof face === "number") {
    return {
      side: face,
      renderInfos: null
    };
  }

  return face;
}

export function CardFaceUncomplicate(face: CardFaceComplicated | number | null): CardFaceComplicated | null {
  if (typeof face === "number") {
    return {
      side: face,
      renderInfos: null
    };
  }

  return face;
}

export function FixDeckCard(deckCard: DeckCardInfo) {
  deckCard.front = CardFaceUncomplicateForSure(deckCard.front);
  deckCard.back = CardFaceUncomplicateForSure(deckCard.back);
}

export function sameCardFace(face1: CardFaceComplicated, face2: CardFaceComplicated): boolean {

  if (face1.side !== face2.side)
    return false;

  if (face1.renderInfos === null && face2.renderInfos === null)
    return true;

  if (face1.renderInfos === null || face2.renderInfos === null)
    return false;

  return compareCardRenderInfoList(face1.renderInfos, face2.renderInfos);
}

export function sameCardFace2(face1: CardFaceComplicated | null, face2: CardFaceComplicated | null): boolean {

  if (face1 === null && face2 === null)
    return true;

  if (face1 === null || face2 === null)
    return false;

  if (face1.side !== face2.side)
    return false;

  if (face1.renderInfos === null && face2.renderInfos === null)
    return true;

  if (face1.renderInfos === null || face2.renderInfos === null)
    return false;

  return compareCardRenderInfoList(face1.renderInfos, face2.renderInfos);
}

export function compareCardRenderInfoList(infos1: CardRenderInfo[], infos2: CardRenderInfo[]) {
  if (infos1.length !== infos2.length)
    return false;

  for (let index = 0; index < infos1.length; index++) {
    const info1 = infos1[index];
    const info2 = infos2[index];

    if (info1.type !== info2.type)
      return false;

    if (!compareCardRenderInfo(info1, info2))
      return false;
  }

  return true;
}

// по хорошему это в сами эти вынести надо но не наю впадву
export function compareCardRenderInfo<T extends CardRenderInfo>(a: T, b: T) {
  if (a.type === "CardTextRender") {
    const a1 = a as unknown as CardTextRender;
    const b1 = b as unknown as CardTextRender;

    return a1.text === b1.text &&
      a1.color === b1.color &&
      a1.x === b1.x &&
      a1.y === b1.y &&
      a1.width === b1.width &&
      a1.height === b1.height;
  }
  else {
    console.error(`compareInfos неизвестный тип типочек ${a.type}`);

    return false;
  }
}
