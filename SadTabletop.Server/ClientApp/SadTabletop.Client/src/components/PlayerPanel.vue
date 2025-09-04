<script setup lang="ts">
import type LeGame from '@/actual/LeGame';
import type Player from '@/actual/things/Player';
import { onMounted, onUnmounted, ref, shallowReactive } from 'vue';
import PlayerPlate from './PlayerPlate.vue';
import { removeItemFromCollection } from '@/utilities/MyCollections';

const props = defineProps<{
  game: LeGame
}>();

const plateWidth = ref(200);
const plateHeight = ref(75);

const players = shallowReactive<Player[]>([]);

onMounted(() => {
  for (const player of props.game.playersContainer.players) {
    players.push(player);
  }

  props.game.playersContainer.events.on("PlayerAdded", playerAdded, this);
  props.game.playersContainer.events.on("PlayerRemoved", playerRemoved, this);
});

onUnmounted(() => {
  props.game.playersContainer.events.off("PlayerAdded", playerAdded, this);
  props.game.playersContainer.events.off("PlayerRemoved", playerRemoved, this);
});

function playerAdded(player: Player) {
  players.push(player);
}
function playerRemoved(player: Player) {
  removeItemFromCollection(players, player);
}
</script>

<template>
  <div style="pointer-events: auto;">
    <PlayerPlate v-for="player in players" :game="props.game" :player="player" :width="plateWidth"
      :height="plateHeight" />
  </div>
</template>
