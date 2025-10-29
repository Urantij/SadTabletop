import type RenderObjectRepresentation from "../RenderObjectRepresentation";

const key = "droptargetglow";

export function applyDropTargetGlow(obj: RenderObjectRepresentation) {
  const preFX = obj.getPreFx();
  if (preFX === null)
    return;

  const glow = preFX.addGlow(0x775577, 2);
  // :)
  obj.cashbackNaVse[key] = glow;
}
export function highDropTargetGlow(obj: RenderObjectRepresentation) {
  const glow = obj.cashbackNaVse[key] as Phaser.FX.Glow | undefined;
  if (glow === undefined)
    return;

  glow.outerStrength = 8;
}
export function lowDropTargetGlow(obj: RenderObjectRepresentation) {
  const glow = obj.cashbackNaVse[key] as Phaser.FX.Glow | undefined;
  if (glow === undefined)
    return;

  glow.outerStrength = 2;
}
export function dropDropTargetGlow(obj: RenderObjectRepresentation) {
  const glow = obj.cashbackNaVse[key] as Phaser.FX.Glow | undefined;
  if (glow === undefined)
    return;

  delete obj.cashbackNaVse[key];

  glow.destroy();
}
