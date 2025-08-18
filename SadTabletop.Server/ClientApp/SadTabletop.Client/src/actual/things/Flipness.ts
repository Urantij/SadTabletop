enum Flipness {
  Shown,
  Hidden
};

export function FlipFlipness(flipness: Flipness) {
  if (flipness === Flipness.Shown) {
    return Flipness.Hidden;
  }
  return Flipness.Shown;
}

export default Flipness;
