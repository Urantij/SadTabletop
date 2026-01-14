<script setup lang="ts">
import type WiwdowBaseData from './Wiwdow/WiwdowBaseData';

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
      left: props.data.x,
      top: props.data.y,
      width: props.data.width,
      height: props.data.height,
      pointerEvents: 'auto',
      backgroundColor: 'darkcyan'
    }
  ]">
    <div>
      <span v-if="props.data.title !== undefined">{{ props.data.title }}</span>
      <button @click="hideClicked()" v-if="props.data.canHide">_</button>
      <button @click="closeClicked()" v-if="props.data.canClose">X</button>
    </div>
    <div>
      <slot></slot>
    </div>
  </div>
</template>
