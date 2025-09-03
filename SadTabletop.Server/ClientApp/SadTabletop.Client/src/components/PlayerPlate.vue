<script setup lang="ts">
import type LeGame from '@/actual/LeGame';
import type Player from '@/actual/things/Player';
import SeatColor from '@/actual/things/SeatColor';
import { onUnmounted, ref } from 'vue';

const props = defineProps<{
  game: LeGame,
  player: Player,
  width: number,
  height: number
}>();

const emit = defineEmits<{
  leftClick: []
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

function clicked() {
  emit("leftClick");
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
