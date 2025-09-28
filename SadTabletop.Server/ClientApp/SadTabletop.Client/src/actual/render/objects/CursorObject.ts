import type Player from "@/actual/things/Player";
import SimpleRenderObjectRepresentation from "../SimpleRenderObjectRepresentation";
import type MainScene from "../MainScene";
import SeatColor from "@/actual/things/SeatColor";
import type Cursor from "@/actual/things/Cursor";
import { DepthChart } from "../Renderer";

const width = 50;
const height = 50;

export const cursorTextureKey = "cursor";

export default class CursorObject extends SimpleRenderObjectRepresentation<Cursor, Phaser.GameObjects.Sprite> {
  readonly player: Player;

  readonly scene: MainScene;

  constructor(player: Player, scene: MainScene, sprite: Phaser.GameObjects.Sprite) {
    super(player.cursor, sprite, false);

    this.player = player;
    this.scene = scene;
  }

  static create(player: Player, scene: MainScene) {

    const sprite = new Phaser.GameObjects.Sprite(scene, player.cursor.x, player.cursor.y, cursorTextureKey);
    sprite.setDisplaySize(width, height);
    sprite.setDepth(DepthChart.Cursor);
    sprite.tint = CursorObject.getCursorTint(player.seat?.color ?? null);
    scene.add.existing(sprite);

    const obj = new CursorObject(player, scene, sprite);

    // xdd

    scene.leGame.playersContainer.events.on("PlayerSeatChanged", obj.seatChanged, obj);

    return obj;
  }

  private seatChanged(player: Player) {
    if (player !== this.player)
      return;

    this.sprite.tint = CursorObject.getCursorTint(player.seat?.color ?? null);
  }

  override destroy(): void {
    super.destroy();

    this.scene.leGame.playersContainer.events.off("PlayerSeatChanged", this.seatChanged, this);
  }

  static getCursorTint(color: SeatColor | null): number {
    if (color === null) {
      return 0x333333;
    }

    switch (color) {

      case SeatColor.Red: return 0x990000;
      case SeatColor.Blue: return 0x000099;
      case SeatColor.Green: return 0x009900;
      case SeatColor.Pink: return 0x990099;
      case SeatColor.Yellow: return 0x009999;
      case SeatColor.White: return 0x999999;

      default: return 0x000000;
    }
  }
}
