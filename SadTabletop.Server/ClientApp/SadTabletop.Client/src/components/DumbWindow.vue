<script setup lang="ts">
import { useUiStore } from '@/stores/UiStore';
import type WiwdowBaseData from './Wiwdow/WiwdowBaseData';

const uiStore = useUiStore();

const props = defineProps<{
  data: WiwdowBaseData
}>();

const emits = defineEmits<{
  closeMe: [],
  hideMe: [],
}>();

function hideClicked() {
  emits("hideMe");
}

function closeClicked() {
  emits("closeMe");
}
</script>

<template>

  <div :style="[
    {
      position: 'absolute',
      left: `${props.data.x}px`,
      top: `${props.data.y}px`,
      width: `${props.data.width}px`,
      height: `${props.data.height}px`,
      pointerEvents: 'auto',
      backgroundColor: 'darkcyan'
    }
  ]">
    <div :style="[{
      height: `${uiStore.titlesHeight}px`
    }]">
      <span v-if="props.data.title !== undefined">{{ props.data.title }}</span>
      <button @click="hideClicked()" v-if="props.data.canHide">_</button>
      <button @click="closeClicked()" v-if="props.data.canClose">X</button>
    </div>
    <div>
      <slot></slot>
    </div>
  </div>
</template>
