import type TypedEmitter from "@/utilities/TypedEmiiter";

// а мне психолог говорила душа выдумка на горе

// что за гора нахуй

type ControlEvents = {
  HandsFocus: (taken: boolean) => void;
}

export default class Control {
  static flipKey = "F";

  static readonly events: TypedEmitter<ControlEvents> = new Phaser.Events.EventEmitter();

  static takeHands(taken: boolean) {
    this.events.emit("HandsFocus", taken);
  }
}
