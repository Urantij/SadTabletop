<script setup lang="ts">
import type LeGame from '@/actual/LeGame';
import { onMounted, onUnmounted, reactive, ref, watch, type Ref } from 'vue';
import PlayerPanel from './PlayerPanel.vue';
import SettingsPanel from './SettingsPanel.vue';
import type PopitOption from './PopitOption';
import Popit from './Popit.vue';
import type PopitData from './PopitData';
import { usePopitStore } from '@/stores/PopitStore';
import Hint from './Hint.vue';
import type Deck from '@/actual/things/concrete/Decks/Deck';
import BigCardsWindow from './BigCardsWindow/BigCardsWindow.vue';
import type CardRenderManager from '@/actual/render/CardRenderManager';
import type DeckCardInfo from '@/actual/things/concrete/Decks/DeckCardInfo';

const popitStore = usePopitStore();

const props = defineProps<{
  game: LeGame,
  // костыль мне впадлу
  draw: boolean,
  cardRenderer: CardRenderManager
}>();

defineExpose({
  showCardsMenu
});

const showSettings = ref(false);
const showPopit = ref(true);
const showPopitButton = ref(false);

const displayDeck: Ref<Deck | null> = ref(null);
const displayDeckCards: Ref<DeckCardInfo[]> = ref([]);

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

// pub

function showCardsMenu(deck: Deck) {
  displayDeckCards.value = deck.cards ?? [];
  displayDeck.value = deck;
}

// privet)

function onResize(ev: UIEvent) {

  style.width = window.innerWidth + 'px';
  style.height = window.innerHeight + 'px';
}

function popitWantsClose() {
  currentPopit.value!.finished = true;
  trySetNextPopit();
}
function popitWantsHide() {
  showPopitButton.value = true;
  showPopit.value = false;
}
function popitChoseOption(option: PopitOption) {
  currentPopit.value!.finished = true;
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
    <div style="width: 500px; height: 50px; justify-self: center;">
      <Hint :game="game"></Hint>
    </div>
    <div style="width: 200px; height: 600px;" v-if="props.draw">
      <PlayerPanel :game="game"></PlayerPanel>
    </div>
    <button style="pointer-events: auto; width: 100px; height: 100px;" @click="(ev) => settingsClicked()">O</button>
    <button v-if="showPopitButton" style="pointer-events: auto; width: 100px; height: 100px;"
      @click="(ev) => popitButtonClicked()">P</button>
    <BigCardsWindow v-if="displayDeck !== null" :title="'дека'" :can-hide="false" :can-close="true" :select="2"
      :cardRender="props.cardRenderer" :cards="displayDeckCards" :style="[
        {
          position: 'absolute', top: '200px', left: '200px', width: '900px', height: '700px'
        }
      ]">
    </BigCardsWindow>
    <Popit v-if="currentPopit !== null" :style="[
      {
        position: 'absolute', top: '300px', left: '500px', width: '500px', height: '500px'
      }]" :data="currentPopit" @close-me="popitWantsClose()" @hide-me="popitWantsHide()"
      @option-clicked="(option) => popitChoseOption(option)">
    </Popit>
    <SettingsPanel :style="[
      {
        position: 'absolute', top: '100px', left: '100px', width: '500px', height: '400px'
      }
    ]" v-if="showSettings" @close-me="() => showSettings = false">
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
