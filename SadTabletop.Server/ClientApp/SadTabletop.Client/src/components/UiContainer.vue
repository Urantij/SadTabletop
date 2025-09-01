<script setup lang="ts">
import type LeGame from '@/actual/LeGame';
import { onMounted, onUnmounted, reactive, ref, render, useTemplateRef } from 'vue';
import PlayerPanel from './PlayerPanel.vue';
import SettingsPanel from './SettingsPanel.vue';

const uicontainer = useTemplateRef("uicontainer");

const props = defineProps<{
  game: LeGame,
  // костыль мне впадлу
  draw: boolean
}>();

const showSettings = ref(false);

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

function settingsClicked() {
  showSettings.value = true;
  // const node = h(SettingsPanel, {
  //   width: window.innerWidth,
  //   height: window.innerHeight,

  //   onCloseMe: () => {
  //     if (uicontainer.value === null)
  //       return;

  //     // я не понимаю как это работает
  //     render(null, uicontainer.value);
  //   }
  // });

  // if (uicontainer.value === null)
  //   return;

  // render(node, uicontainer.value);
}
</script>

<template>
  <div ref="uicontainer" id="uicontainer" class="uicontainer" :style="[
    style
  ]">
    <div style="width: 200px; height: 600px;" v-if="props.draw">
      <PlayerPanel :game="game"></PlayerPanel>
    </div>
    <button style="pointer-events: auto; width: 100px; height: 100px;" @click="(ev) => settingsClicked()">O</button>
    <SettingsPanel style="position: absolute; top: 100px; left: 100px;" v-if="showSettings" :width="500" :height="400"
      @close-me="() => showSettings = false">
    </SettingsPanel>
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
