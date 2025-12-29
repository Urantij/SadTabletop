<script setup lang="ts">
import CardRenderManager from '@/actual/render/CardRenderManager';
import DumbWindow from '../DumbWindow.vue';
import type DeckCardInfo from '@/actual/things/concrete/Decks/DeckCardInfo';
import { onBeforeMount, onUnmounted, reactive, ref } from 'vue';
import CardObject, { defaultFrontSidekey } from '@/actual/render/objects/CardObject';
import type BigCardsWiwdowData from './BigCardsWiwdowData';
import { useRendererStore } from '@/stores/RendererStore';

const rendererStore = useRendererStore();

const props = defineProps<{
  data: BigCardsWiwdowData
}>();

const emits = defineEmits<{
  (e: "hideMe"): void,
  (e: "closeMe"): void,
  (e: 'selectionMade', cards: DeckCardInfo[]): void
}>();

interface CardData {
  card: DeckCardInfo,
  textureKey: string,
  dataUrl: string,
  selected: boolean
}

const cards: CardData[] = reactive([]);
const selectedCount = ref(0);

onBeforeMount(() => {
  if (rendererStore.renderer === null)
    return;

  for (const c of props.data.cards) {
    const texture = CardObject.getCardSideTexture(c.front, defaultFrontSidekey, rendererStore.renderer.scene);

    const base64 = texture.manager.getBase64(texture.key);

    // соси хуй быдло, блоббрл из внутреннего img элемента не работает в имеджах, которые создаю я.
    // так что дублируем картинки, хули делать
    // const img = texture.source[0].image;
    // if (img instanceof Uint8Array) {
    //   console.error("што это ???");
    //   return;
    // }
    // let dataUrl: string;
    // if (img instanceof HTMLCanvasElement) {
    //   dataUrl = 'url(' + img.toDataURL("image/png") + ')';
    // }
    // else if (img instanceof HTMLImageElement) {
    //   dataUrl = img.currentSrc;
    // }
    // else {
    //   console.error("што это");
    //   return;
    // }

    cards.push({
      card: c,
      textureKey: texture.key,
      dataUrl: base64,
      selected: false
    });
  }
});

onUnmounted(() => {
  if (rendererStore.renderer === null)
    return;

  for (const container of cards) {
    if (CardRenderManager.isCustomCardId(container.textureKey)) {
      rendererStore.renderer.freeCardTexture(container.textureKey);
    }
  }
});

function imgClicked(card: CardData) {

  if (props.data.max <= 0)
    return;

  if (card.selected) {
    card.selected = false;
    selectedCount.value--;
    return;
  }

  if (selectedCount.value === props.data.max)
    return;

  card.selected = true;
  selectedCount.value++;

  if (props.data.max === 1) {
    makeSelection([card.card]);
  }
}

function hideMeClicked() {
  emits("hideMe");
}

function closeClicked() {
  emits("closeMe");
}

function selectClicked() {
  const selected = cards.filter(c => c.selected).map(c => c.card);

  makeSelection(selected);
}

function makeSelection(cards: DeckCardInfo[]) {
  emits("selectionMade", cards);
}

</script>

<template>
  <DumbWindow :style="[
    {
      backgroundColor: 'darkgray'
    }
  ]" :data="props.data" v-on:hide-me="hideMeClicked()" v-on:close-me="closeClicked()">
    <div :style="[
      {
        'display': 'flex',
        'flex-wrap': 'wrap',
        'justify-content': 'space-around',
        'overflow': 'scroll',
        'height': '500px'
      }
    ]">
      <template v-for="card in cards">
        <img :class="{ 'selected': card.selected }" :src="card.dataUrl" v-on:click="() => imgClicked(card)"></img>
      </template>
    </div>
    <div v-if="props.data.max > 1">
      <button :disabled="props.data.min < selectedCount" @click="selectClicked()">селект</button>
    </div>
  </DumbWindow>
</template>

<style lang="css">
.selected {
  box-shadow: 0px 0px 5px #2cff36;
}
</style>
