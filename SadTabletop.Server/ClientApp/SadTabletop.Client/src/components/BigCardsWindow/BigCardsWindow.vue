<script setup lang="ts">
import CardRenderManager from '@/actual/render/CardRenderManager';
import DumbWindow from '../DumbWindow.vue';
import type DeckCardInfo from '@/actual/things/concrete/Decks/DeckCardInfo';
import { onBeforeMount, onUnmounted, reactive, ref } from 'vue';
import CardObject, { defaultFrontSidekey } from '@/actual/render/objects/CardObject';

const props = defineProps<{
  title: string | undefined,
  canHide: boolean,
  canClose: boolean,
  cardRender: CardRenderManager,
  cards: DeckCardInfo[],
  select: number
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
  for (const c of props.cards) {
    const texture = CardObject.getCardSideTexture(c.front, defaultFrontSidekey, props.cardRender.scene);

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
  for (const container of cards) {
    if (CardRenderManager.isCustomCardId(container.textureKey)) {
      props.cardRender.freeCardTexture(container.textureKey);
    }
  }
});

const emits = defineEmits<{
  "HideMe": [],
  "CloseMe": []
}>();

function imgClicked(card: CardData) {

  if (props.select <= 0)
    return;

  if (card.selected) {
    card.selected = false;
    selectedCount.value--;
    return;
  }

  if (selectedCount.value === props.select)
    return;

  card.selected = true;
  selectedCount.value++;
}

function hideMeClicked() {
  emits("HideMe");
}

function closeClicked() {
  emits("CloseMe");
}

</script>

<template>
  <DumbWindow :style="[
    {
      backgroundColor: 'darkgray'
    }
  ]" :title="props.title" :can-hide="props.canHide" :can-close="props.canClose" v-on:hide-me="hideMeClicked()"
    v-on:close-me="closeClicked()">
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
  </DumbWindow>
</template>

<style lang="css">
selected {
  box-shadow: 0px 0px 5px #2cff36;
}
</style>
