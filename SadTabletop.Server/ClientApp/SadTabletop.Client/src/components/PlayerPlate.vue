<script setup lang="ts">
import type LeGame from '@/actual/LeGame';
import type Player from '@/actual/things/Player';
import SeatColor, { getLocalizedSeatColor } from '@/actual/things/SeatColor';
import connectionInstance from '@/communication/ConnectionDva';
import { usePopitStore } from '@/stores/PopitStore';
import { onUnmounted, ref } from 'vue';
import type PopitOption from './PopitOption';
import type TakeSeatMessage from '@/communication/messages/client/TakeSeatMessage';
import type PopitData from './PopitData';

const popitStore = usePopitStore();

let changeChairPopit: PopitData | null = null;

const props = defineProps<{
  game: LeGame,
  player: Player,
  width: number,
  height: number
}>();

const color = ref(getColor());;
const name = ref(props.player.name);

props.game.playersContainer.events.on("PlayerSeatChanged", playerSeatChanged, this);
props.game.playersContainer.events.on("PlayerNameChanged", playerNameChanged, this);

onUnmounted(() => {
  props.game.playersContainer.events.off("PlayerSeatChanged", playerSeatChanged, this);
  props.game.playersContainer.events.off("PlayerNameChanged", playerNameChanged, this);
});

function playerSeatChanged(player: Player) {
  if (player !== props.player)
    return;

  color.value = getColor();
}
function playerNameChanged(player: Player) {
  if (player !== props.player)
    return;

  name.value = player.name;
}

function getColor() {
  if (props.player.seat === null) {
    return "gray";
  }

  switch (props.player.seat.color) {
    case SeatColor.Red: return "red";
    case SeatColor.Blue: return "blue";
    case SeatColor.Green: return "green";
    case SeatColor.Pink: return "pink";
    case SeatColor.Yellow: return "yellow";
    case SeatColor.White: return "white";

    default: return "black";
  }
}

function clicked() {
  if (props.player === props.game.ourPlayer) {

    if (changeChairPopit?.finished === false)
      return;

    const options: PopitOption[] = props.game.bench.entities
      .filter(s => !props.game.playersContainer.isSeatBusy(s))
      .map<PopitOption>(seat => {
        return {
          title: getLocalizedSeatColor(seat.color),
          callback: () => {

            if (props.game.playersContainer.isSeatBusy(seat)) {
              return;
            }

            const message: TakeSeatMessage = {
              seatId: seat.id
            };

            connectionInstance.sendMessage("TakeSeatMessage", message);
          }
        };
      });

    if (props.game.ourPlayer.seat !== null) {
      options.push({
        title: "слезть",
        callback: () => {
          if (props.game.ourPlayer?.seat === null)
            return;

          const message: TakeSeatMessage = {
            seatId: null
          };

          connectionInstance.sendMessage("TakeSeatMessage", message);
        }
      });
    }

    changeChairPopit = popitStore.addPopit("Выбираешь стул?", options, false, true);
  }
}
</script>

<template>
  <div :style="[
    {
      width: `${props.width}px`,
      height: `${props.height}px`,
      backgroundColor: color
    }
  ]" v-on:click="clicked">
    <span>{{ name }}</span>
  </div>
</template>
