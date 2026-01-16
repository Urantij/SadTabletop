<script setup lang="ts">
import type LeGame from '@/actual/LeGame';
import { onMounted, onUnmounted, reactive, ref, watch, type Ref } from 'vue';
import PlayerPanel from './PlayerPanel.vue';
import type PopitOption from './PopitOption';
import Popit from './Popit/Popit.vue';
import { usePopitStore } from '@/stores/PopitStore';
import Hint from './Hint.vue';
import type Deck from '@/actual/things/concrete/Decks/Deck';
import type DeckCardInfo from '@/actual/things/concrete/Decks/DeckCardInfo';
import type WiwdowBaseData from './Wiwdow/WiwdowBaseData';
import SettingsWindow from './SettingsWindow/SettingsWindow.vue';
import WiwdowType from './Wiwdow/WiwdowType';
import type SettingsWiwdowData from './SettingsWindow/SettingsWiwdowData';
import type BigCardsWiwdowData from './BigCardsWindow/BigCardsWiwdowData';
import BigCardsWindow from './BigCardsWindow/BigCardsWindow.vue';
import { findForSure, removeFromCollection } from '@/utilities/MyCollections';
import ChatWiwdow from './Chat/ChatWiwdow.vue';
import type ChatWiwdowData from './Chat/ChatWiwdowData';
import type { PopitWiwdowData } from './Popit/PopitWiwdowData';
import type PopitData from './PopitData';

const popitStore = usePopitStore();

const props = defineProps<{
  game: LeGame,
  // костыль мне впадлу
  draw: boolean,
}>();

defineExpose({
  showCardsMenu,
  openCardsSelection
});

let nextWiwdowId = 1;
function getNextWiwdowId() { return nextWiwdowId++ };

const wiwdows: WiwdowBaseData[] = reactive([]);
const wiwdowsButHidden: WiwdowBaseData[] = reactive([]);
const chatWiwdow: ChatWiwdowData = reactive({
  id: getNextWiwdowId(),
  canClose: false,
  canHide: false,
  width: 300,
  height: 300,
  title: 'chatik',
  type: WiwdowType.Chat,
  hidden: false,
  x: 0,
  y: 0
});
chatWiwdow.x = window.innerWidth - chatWiwdow.width;
chatWiwdow.y = window.innerHeight - chatWiwdow.height;

// я не нашёл инфу че будет если хранить функции в реактируемой объекте
const handlersData: {
  id: number,
  nonReactiveCardsData: DeckCardInfo[],
  handler: ((selected: DeckCardInfo[]) => void) | null,
}[] = [];

const showPopit = ref(true);
const showPopitButton = ref(false);

const currentPopit: Ref<PopitWiwdowData | null> = ref(null);

const style = reactive({
  'width': window.innerWidth + 'px',
  'height': window.innerHeight + 'px',
});

watch(popitStore.arr, () => {
  if (currentPopit.value !== null)
    return;

  if (popitStore.arr.length === 0)
    return;

  const popitData = popitStore.arr[0];
  createPopitWiwdow(popitData);

  popitStore.arr.shift();
}, {
  flush: "post"
});

function trySetNextPopit() {
  if (popitStore.arr.length === 0) {
    currentPopit.value = null;
    return;
  }

  const popitData = popitStore.arr[0];
  createPopitWiwdow(popitData);

  popitStore.arr.shift();
}

function createPopitWiwdow(data: PopitData) {
  const popitWiwdow: PopitWiwdowData = {
    id: getNextWiwdowId(),
    x: 300,
    y: 500,
    width: 500,
    height: 500,

    hidden: false,
    type: WiwdowType.Popit,

    title: data.title,
    canClose: data.canClose,
    canHide: data.canHide,
    popit: data,
  };
  currentPopit.value = popitWiwdow;
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
  if (deck.cards === null) {
    console.warn(`а как ты хош показать деку без карт? ${deck.id}`);
    return;
  }

  const data: BigCardsWiwdowData = {
    id: getNextWiwdowId(),
    x: 100,
    y: 100,
    width: 800,
    height: 600,
    canClose: true,
    canHide: false,
    title: "смари деку",
    min: 0,
    max: 0,
    cards: deck.cards,
    type: WiwdowType.BigCards,
    hidden: false
  };

  handlersData.push({
    id: data.id,
    nonReactiveCardsData: deck.cards,
    handler: null
  });

  const dataR = reactive(data);
  wiwdows.push(dataR);
}

function openCardsSelection(cards: DeckCardInfo[], min: number, max: number, handler: (selected: DeckCardInfo[]) => void) {
  const data: BigCardsWiwdowData = {
    id: getNextWiwdowId(),
    x: 100,
    y: 100,
    width: 800,
    height: 600,
    canClose: false,
    canHide: true,
    title: "выбери",
    min: min,
    max: max,
    cards: cards,
    type: WiwdowType.BigCards,
    hidden: false
  };

  handlersData.push({
    id: data.id,
    nonReactiveCardsData: cards,
    handler: handler
  });

  const dataR = reactive(data);
  wiwdows.push(dataR);
}

// privet)

function onResize(ev: UIEvent) {

  console.log(window.innerWidth);

  style.width = window.innerWidth + 'px';
  style.height = window.innerHeight + 'px';

  chatWiwdow.x = window.innerWidth - chatWiwdow.width;
  chatWiwdow.y = window.innerHeight - chatWiwdow.height;

  for (const wiwdow of wiwdows) {
    if (wiwdow.type === WiwdowType.Chat) {
      // wiwdow.x = window.innerWidth - wiwdow.width;
      // wiwdow.y = window.innerHeight - wiwdow.height;
    }
  }
}

function popitWantsClose() {
  currentPopit.value!.popit.finished = true;
  trySetNextPopit();
}
function popitWantsHide() {
  showPopitButton.value = true;
  showPopit.value = false;
}
function popitChoseOption(option: PopitOption) {
  currentPopit.value!.popit.finished = true;
  trySetNextPopit();

  option.callback();
}

function openSettingsWindow() {
  const data: SettingsWiwdowData = {
    id: getNextWiwdowId(),
    x: 200,
    y: 200,
    width: 500,
    height: 600,
    canHide: false,
    canClose: true,
    title: "Настроечки",
    type: WiwdowType.Settings,
    hidden: false
  };

  const dataR = reactive(data);
  wiwdows.push(dataR);
}

function cardsSelected(data: BigCardsWiwdowData, selectedCards: DeckCardInfo[]) {

  const hdata = removeFromCollection(handlersData, h => h.id === data.id);

  if (hdata === undefined) {
    console.error(`уэ хендлер не нашёлсся в доте`);
    return;
  }

  const realCards = selectedCards.map(selectedCard => findForSure(hdata.nonReactiveCardsData, real => real.id === selectedCard.id));

  closeWiwdow(data);

  if (hdata.handler === null) {
    console.error(`уэ хендлер нулл в селекшене?`);
    return;
  }

  hdata.handler(realCards);
}

function closeWiwdow(data: WiwdowBaseData) {
  const index = wiwdows.findIndex(w => w.id === data.id);

  if (index === -1) {
    console.warn(`попытка закрыть несуществующее окно ${data.type} ${data.title}`);
    return;
  }

  wiwdows.splice(index, 1);

  if (data.type === WiwdowType.BigCards) {
    removeFromCollection(handlersData, h => h.id === data.id);
  }
}

function hideWiwdow(data: WiwdowBaseData) {
  data.hidden = true;
  wiwdowsButHidden.push(data);
}

function wiwdowWantsToClose(data: WiwdowBaseData) {
  closeWiwdow(data);
}

function wiwdowWantsToHide(data: WiwdowBaseData) {
  hideWiwdow(data);
}

function settingsClicked() {

  const existing = wiwdows.find(w => w.type === WiwdowType.Settings) as SettingsWiwdowData | undefined;

  if (existing !== undefined) {
    closeWiwdow(existing);
  }
  else {
    openSettingsWindow();
  }
}

function popitButtonClicked() {
  showPopitButton.value = false;
  showPopit.value = true;
}

function unhideButtonClicked() {
  const last = wiwdowsButHidden.pop();
  if (last === undefined) {
    console.warn("a? unhideButtonClicked");
    return;
  }

  last.hidden = false;
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
    <ChatWiwdow :data="chatWiwdow"></ChatWiwdow>
    <template v-for="wiwdow in wiwdows">
      <BigCardsWindow v-if="wiwdow.type === WiwdowType.BigCards" v-show="!wiwdow.hidden"
        :data="wiwdow as BigCardsWiwdowData" @close-me="() => wiwdowWantsToClose(wiwdow)"
        @hide-me="() => wiwdowWantsToHide(wiwdow)"
        @selection-made="(cards) => cardsSelected(wiwdow as BigCardsWiwdowData, cards)"></BigCardsWindow>
      <SettingsWindow v-if="wiwdow.type === WiwdowType.Settings" v-show="!wiwdow.hidden"
        :data="wiwdow as SettingsWiwdowData" @close-me="() => wiwdowWantsToClose(wiwdow)"></SettingsWindow>
    </template>
    <button class="bubutton" @click="(ev) => settingsClicked()">O</button>
    <button class="bubutton" v-if="showPopitButton" @click="(ev) => popitButtonClicked()">P</button>
    <button class="bubutton" v-if="wiwdowsButHidden.length > 0" @click="(ev) => unhideButtonClicked()">H</button>
    <Popit v-if="currentPopit !== null" :data="currentPopit" @close-me="popitWantsClose()" @hide-me="popitWantsHide()"
      @option-clicked="(option) => popitChoseOption(option)">
    </Popit>
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

.bubutton {
  pointer-events: auto;
  width: 100px;
  height: 100px;
}
</style>
