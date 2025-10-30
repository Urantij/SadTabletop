import { removeItemFromCollection } from "@/utilities/MyCollections";
import type RenderObjectRepresentation from "./RenderObjectRepresentation";
import { applyDropTargetGlow, dropDropTargetGlow, highDropTargetGlow, lowDropTargetGlow } from "./effects/DropGlow";

/**
 * Кто то должен следить за тем, кого подсвечивать для "выбора"
 * Если карта с целью тянется, светить то, что можно активировать
 * Если карта без цели, просто не светить
 * Если не тянется, светить то, что можно кликнуть
 */
export default class SelectionGlowManager {

  drag: boolean = false;
  readonly dropTargets: RenderObjectRepresentation[] = [];
  readonly strongs: RenderObjectRepresentation[] = [];
  readonly clicks: RenderObjectRepresentation[] = [];

  clear() {
    this.drag = false;
    this.dropTargets.splice(0);
    this.strongs.splice(0);
    this.clicks.splice(0);
  }

  addClicky(obj: RenderObjectRepresentation) {
    this.clicks.push(obj);

    if (!this.drag) {
      applyDropTargetGlow(obj);
    }
  }

  removeObject(obj: RenderObjectRepresentation) {
    removeItemFromCollection(this.clicks, obj);
    removeItemFromCollection(this.dropTargets, obj);
  }

  removeClicky(obj: RenderObjectRepresentation) {
    removeItemFromCollection(this.clicks, obj);

    if (!this.drag) {
      dropDropTargetGlow(obj);
    }
  }

  cardDragStarted(dropTargets: RenderObjectRepresentation[]) {
    this.dropTargets.push(...dropTargets);
    this.drag = true;

    for (const clieck of this.clicks) {
      dropDropTargetGlow(clieck);
    }

    for (const dragged of dropTargets) {
      applyDropTargetGlow(dragged);
    }
  }

  cardDragEnded() {
    this.drag = false;
    this.strongs.splice(0);

    for (const dragged of this.dropTargets) {
      dropDropTargetGlow(dragged);
    }
    this.dropTargets.splice(0);

    for (const clieck of this.clicks) {
      applyDropTargetGlow(clieck);
    }
  }

  cardDragMoved(worldX: number, worldY: number) {
    for (const target of this.dropTargets) {
      if (target.positionTest(worldX, worldY)) {
        if (!this.strongs.includes(target)) {
          highDropTargetGlow(target);
          this.strongs.push(target);
        }
      }
      else {
        if (removeItemFromCollection(this.strongs, target)) {
          lowDropTargetGlow(target);
        }
      }
    }
  }
}
