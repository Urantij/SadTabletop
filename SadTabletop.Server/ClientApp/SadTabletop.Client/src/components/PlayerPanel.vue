<script setup lang="ts">
import type LeGame from '@/actual/LeGame';
import type Player from '@/actual/things/Player';
import { shallowReactive } from 'vue';
import PlayerPlate from './PlayerPlate.vue';

const props = defineProps<{
  game: LeGame,
}>();

const players = shallowReactive<Player[]>(props.game.playersContainer.players);

function playerClicked(player: Player) {
}
</script>

<template>
  <div>
    <PlayerPlate style="height: 100px;" v-for="player in players" :game="props.game" :player="player"
      v-on:left-click="() => playerClicked(player)" />
  </div>
</template>
