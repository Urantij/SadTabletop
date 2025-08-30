<script setup lang="ts">
import type LeGame from '@/actual/LeGame';
import { onMounted, onUnmounted, reactive } from 'vue';
import PlayerPanel from './PlayerPanel.vue';

const props = defineProps<{
  game: LeGame,
  // костыль мне впадлу
  draw: boolean
}>();

const style = reactive({
  'width': window.innerWidth + 'px',
  'height': window.innerHeight + 'px',
});

onMounted(async () => {

  window.addEventListener('resize', onResize);

  style.width = window.innerWidth + 'px';
  style.height = window.innerHeight + 'px';
});

onUnmounted(() => {

  window.removeEventListener('resize', onResize);
});

function onResize(ev: UIEvent) {

  style.width = window.innerWidth + 'px';
  style.height = window.innerHeight + 'px';
}
</script>

<template>
  <div id="uicontainer" class="uicontainer" :style="[
    style
  ]">
    <div style="width: 200px; height: 600px;" v-if="props.draw">
      <PlayerPanel :game="game"></PlayerPanel>
    </div>
  </div>
</template>

// просто украл стиль из фазеровского дом контейнера
<style>
.uicontainer {
  display: block;
  padding: 0px;
  margin-right: 0px;
  margin-bottom: 0px;
  position: absolute;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}
</style>
