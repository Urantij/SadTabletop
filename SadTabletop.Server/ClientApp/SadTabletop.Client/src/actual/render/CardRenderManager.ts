import { removeItemFromCollection } from "@/utilities/MyCollections";
import type CardRenderInfo from "../things/concrete/Cards/CardRenderInfo";
import type CardTextRender from "../things/concrete/Cards/render/CardTextRender";
import { makeCardTextureId } from "./MainScene";
import { defaultFrontSidekey } from "./objects/CardObject";
import Sizes from "./Sizes";
import type BaseScene from "./BaseScene";
import { compareCardRenderInfoList } from "../things/concrete/Cards/CardCompareHelper";

interface Container {
  side: number;
  infos: CardRenderInfo[];
  texture: Phaser.Textures.Texture;
  uses: number;
}

/**
 * Генерирует и хранит рубашки карт с рендерными особенностями развития
 */
export default class CardRenderManager {

  readonly scene: BaseScene;

  static readonly containers: Container[] = [];

  private static localId = 1;

  constructor(scene: BaseScene) {
    this.scene = scene;
  }

  allocCardTexture(side: number, infos: CardRenderInfo[]): Phaser.Textures.Texture {

    const existing = CardRenderManager.containers.find(t => t.side === side && compareCardRenderInfoList(t.infos, infos));

    if (existing !== undefined) {
      existing.uses++;
      return existing.texture;
    }

    const texture = this.createTexture(side, infos);

    const container: Container = {
      side: side,
      infos: structuredClone(infos),
      texture: texture,
      uses: 1
    };
    CardRenderManager.containers.push(container);

    return texture;
  }

  freeCardTexture(key: string) {
    const container = CardRenderManager.containers.find(c => c.texture.key === key);

    if (container === undefined) {
      console.warn(`freeCardTexture нет такой текстуры ${key}`);
      return;
    }

    container.uses--;

    if (container.uses === 0) {
      removeItemFromCollection(CardRenderManager.containers, container);
    }
  }

  static makeCustomCardId() {
    return `customcard${CardRenderManager.localId++}`;
  }

  static isCustomCardId(key: string) {
    return key.startsWith("customcard");
  }

  private createTexture(side: number, infos: CardRenderInfo[]) {
    const baseTextureCardId = makeCardTextureId(side);
    const resultTextureId: string = CardRenderManager.makeCustomCardId();

    let baseTexture: Phaser.Textures.Texture;

    let baseTextureId = this.scene.textures.exists(baseTextureCardId) ? baseTextureCardId : defaultFrontSidekey;

    // TODO поч оно возвращает нул?
    const texture = this.scene.textures.addDynamicTexture(resultTextureId, Sizes.cardWidth, Sizes.cardHeight);

    if (texture == null) {
      throw new Error(`CardRenderManager.getCardTexture texture == null`);
    }

    texture.draw(baseTextureId);

    for (const info of infos) {
      this.drawInfo(texture, info);
    }

    return texture;
  }

  private drawInfo(texture: Phaser.Textures.DynamicTexture, info: CardRenderInfo) {

    if (info.type === "CardTextRender") {
      const info1 = info as unknown as CardTextRender;

      const text = new Phaser.GameObjects.Text(this.scene, 0, 0, info1.text, {
        color: info1.color ?? undefined,
        align: "center",
        fixedWidth: info1.height,
        fixedHeight: info1.height,
      });

      texture.draw(text, info1.x, info1.y);
    }
    else {
      console.error(`drawInfo хто то ${info.type}`);
    }
  }
}
