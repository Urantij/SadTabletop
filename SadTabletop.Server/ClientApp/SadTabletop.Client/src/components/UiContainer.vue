<script setup lang="ts">
import type LeGame from '@/actual/LeGame';
import { onMounted, onUnmounted, reactive, ref, render, useTemplateRef, watch, type Ref } from 'vue';
import PlayerPanel from './PlayerPanel.vue';
import SettingsPanel from './SettingsPanel.vue';
import type PopitOption from './PopitOption';
import Popit from './Popit.vue';
import type PopitData from './PopitData';
import { usePopitStore } from '@/stores/PopitStore';

const uicontainer = useTemplateRef("uicontainer");

const popitStore = usePopitStore();

const props = defineProps<{
  game: LeGame,
  // костыль мне впадлу
  draw: boolean
}>();

const showSettings = ref(false);
const showPopit = ref(true);
const showPopitButton = ref(false);

const currentPopit: Ref<PopitData | null> = ref(null);

const style = reactive({
  'width': window.innerWidth + 'px',
  'height': window.innerHeight + 'px',
});

watch(popitStore.arr, () => {
  if (currentPopit.value !== null)
    return;

  if (popitStore.arr.length === 0)
    return;

  currentPopit.value = popitStore.arr[0];
  popitStore.arr.shift();
}, {
  flush: "post"
});

function trySetNextPopit() {
  if (popitStore.arr.length === 0) {
    currentPopit.value = null;
    return;
  }

  currentPopit.value = popitStore.arr[0];
  popitStore.arr.shift();
}

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

function popitWantsClose() {
  trySetNextPopit();
}
function popitWantsHide() {
  showPopitButton.value = true;
  showPopit.value = false;
}
function popitChoseOption(option: PopitOption) {
  trySetNextPopit();

  option.callback();
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

function popitButtonClicked() {
  showPopitButton.value = false;
  showPopit.value = true;
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
    <button v-if="showPopitButton" style="pointer-events: auto; width: 100px; height: 100px;"
      @click="(ev) => popitButtonClicked()">P</button>
    <Popit v-if="currentPopit !== null" style="position: absolute; top: 300px; left: 300px" :width="500" :height="300"
      :data="currentPopit" @close-me="popitWantsClose()" @hide-me="popitWantsHide()"
      @option-clicked="(option) => popitChoseOption(option)">
    </Popit>
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
