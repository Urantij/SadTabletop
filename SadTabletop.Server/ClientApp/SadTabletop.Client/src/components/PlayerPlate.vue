<script setup lang="ts">
import type LeGame from '@/actual/LeGame';
import type Player from '@/actual/things/Player';
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

onUnmounted(() => {
  props.game.playersContainer.events.off("PlayerSeatChanged", playerSeatChanged, this);
});

function playerSeatChanged(player: Player) {
  if (player !== props.player)
    return;

  color.value = getColor();
}

function clicked() {
  emit("leftClick");
}

function getColor() {
  if (props.player.seat === null) {
    return "gray";
  }

  return "green";
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
