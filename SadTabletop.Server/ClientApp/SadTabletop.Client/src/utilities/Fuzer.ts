export default class Fuzer {
  /**
   * Возвращает 0-1 позицию курсора внутри карты
   * @param pointer
   * @param element
   * @returns
   */
  static getRelativeOnSpritePosition(pointer: Phaser.Input.Pointer, sprite: Phaser.GameObjects.Sprite, camera: Phaser.Cameras.Scene2D.Camera) {
    const cursorPos = pointer.positionToCamera(camera) as Phaser.Math.Vector2;

    // const spritePos = sprite.getLocalPoint(cursorPos.x, cursorPos.y, undefined, this.handCamera);

    const spritePos = sprite.getCenter(undefined, true);

    cursorPos.x -= spritePos.x;
    cursorPos.y -= spritePos.y;

    cursorPos.x /= sprite.displayWidth;
    cursorPos.y /= sprite.displayHeight;

    return cursorPos;
  }
}
