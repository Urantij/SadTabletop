enum SeatColor {
  Red,
  Blue,
  Green,
  Pink,
  Yellow,
  White
};

// TODO ха ха ЛОКАЛАЙЗД)))
export function getLocalizedSeatColor(color: SeatColor) {
  switch (color) {

    case SeatColor.Red: return "красни";
    case SeatColor.Blue: return "сини";
    case SeatColor.Green: return "зиёни";
    case SeatColor.Pink: return "розови";
    case SeatColor.Yellow: return "желти";
    case SeatColor.White: return "бели";

    default: return "hz";
  }
}

export default SeatColor;
