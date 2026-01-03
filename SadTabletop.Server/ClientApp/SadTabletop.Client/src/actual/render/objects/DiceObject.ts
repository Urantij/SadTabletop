import type Dice from "@/actual/things/concrete/Dices/Dice";
import SimpleRenderObjectRepresentation from "../SimpleRenderObjectRepresentation";
import type BaseScene from "../BaseScene";
import { makeTextureId } from "../MainScene";
import Sizes from "../Sizes";

type Referenced = {
  references: number;
}

interface RollAnimation {
  rolls: number;
  currentTimer: Phaser.Time.TimerEvent;
}

const betweenRollsTimeMs = 50;
const rollsToDo = 10;

export const defaultDiceTextureKey = "defaultdice";

export default class DiceObject extends SimpleRenderObjectRepresentation<Dice, Phaser.GameObjects.Sprite> {

  private currentRoll: RollAnimation | null = null;

  static create(dice: Dice, scene: BaseScene) {

    const texture = DiceObject.makeTextureFromDice(dice, scene);

    const sprite = scene.add.sprite(dice.x, dice.y, texture);

    const result = new DiceObject(dice, sprite, true);

    return result;
  }

  public updateSide() {
    if (this.currentRoll !== null) {
      this.currentRoll.currentTimer.remove();
      this.currentRoll = null;
    }

    this.setSideCurrent();
  }

  public roll() {
    if (this.currentRoll !== null) {
      this.currentRoll.currentTimer.remove();
      this.currentRoll = null;
    }

    // :)
    const anim: RollAnimation = {
      rolls: 0,
      currentTimer: this.sprite.scene.time.delayedCall(Number.MAX_VALUE, () => { }, undefined, undefined)
    };
    this.currentRoll = anim;
    anim.currentTimer.reset({
      delay: betweenRollsTimeMs,
      callbackScope: this,
      callback: () => this.rollAction(anim),
    });
  }

  private setSideCurrent() {
    const newTexture = DiceObject.makeTextureFromDice(this.gameObject, this.sprite.scene as BaseScene);
    this.swapTextures(newTexture);
  }

  private setSideIndex(index: number) {
    // не проверяю потому что лично мне поебать
    const side = this.gameObject.sides[index];

    const newTexture = DiceObject.makeTexture(side.assetId ?? this.gameObject.defaultAssetId, side.display, this.sprite.scene as BaseScene);
    this.swapTextures(newTexture);
  }

  private rollAction(anim: RollAnimation) {
    if (this.destroyed)
      return;
    if (this.currentRoll !== anim)
      return;

    if (anim.rolls < rollsToDo) {
      const index = Math.floor(Math.random() * this.gameObject.sides.length);
      this.setSideIndex(index);

      anim.rolls++;
      anim.currentTimer = this.sprite.scene.time.delayedCall(anim.currentTimer.delay, anim.currentTimer.callback, anim.currentTimer.args, anim.currentTimer.callbackScope);
    }
    else {
      this.currentRoll = null;
      this.setSideCurrent();
      return;
    }
  }

  private swapTextures(newTexture: Phaser.Textures.Texture) {
    const oldTexture = this.sprite.texture;

    // this.sprite.texture = newTexture;
    this.sprite.setTexture(newTexture.key);

    DiceObject.unmakeTexture(oldTexture, this.sprite.scene);
  }

  static unmakeTexture(texture: Phaser.Textures.Texture, scene: Phaser.Scene) {

    const ref = texture as unknown as Referenced;

    if (ref.references === undefined)
      return;

    ref.references--;

    if (ref.references > 0)
      return;

    scene.textures.remove(texture);
  }

  static makeTextureFromDice(dice: Dice, scene: BaseScene) {
    if (dice.currentSideIndex !== null) {
      const side = dice.sides[dice.currentSideIndex];
      return DiceObject.makeTexture(side.assetId ?? dice.defaultAssetId, side.display, scene);
    }

    return DiceObject.makeTexture(dice.defaultAssetId, "?", scene);
  }

  static makeTexture(assetId: number | null, display: string | null, scene: BaseScene) {
    let background: Phaser.Textures.Texture;

    if (assetId !== null) {
      background = scene.textures.get(makeTextureId(assetId));
    }
    else {
      background = scene.textures.get(defaultDiceTextureKey);
    }

    if (display === null) {
      return background;
    }

    const resultKey = `diceCustom+${background.key}+${display}`;

    // да можно сразу взять ит проверить но я не наю где миссинг кей и я устау TODO
    if (scene.textures.exists(resultKey)) {
      const res = scene.textures.get(resultKey);

      (res as unknown as Referenced).references++; // xd

      return res;
    }

    const dyn = scene.textures.addDynamicTexture(resultKey, Sizes.diceWidth, Sizes.diceHeight)!;

    if (dyn == null) {
      throw new Error(`dice addDynamicTexture dyn == null`);
    }

    dyn.draw(background.key);

    const text = new Phaser.GameObjects.Text(scene, 0, 0, display, {
      align: "center",
      fixedWidth: Sizes.diceWidth,
      fixedHeight: Sizes.diceHeight,
    });

    dyn.draw(text);

    (dyn as unknown as Referenced).references = 1; // xd

    return dyn;
  }

  override destroy(): void {

    const scene = this.sprite.scene;
    const texture = this.sprite.texture;

    super.destroy();

    DiceObject.unmakeTexture(texture, scene);
  }
}
