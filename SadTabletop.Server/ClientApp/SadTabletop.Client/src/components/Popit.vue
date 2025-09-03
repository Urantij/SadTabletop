<script setup lang="ts">
import type PopitData from './PopitData';
import type PopitOption from './PopitOption';

const props = defineProps<{
  width: number,
  height: number,
  data: PopitData
}>();

const emits = defineEmits<{
  closeMe: [],
  hideMe: [],
  optionClicked: [PopitOption]
}>();

function hideClicked() {
  emits("hideMe");
}

function closeClicked() {
  emits("closeMe");
}

function optionClicked(option: PopitOption) {
  emits("optionClicked", option);
}

</script>

<template>

  <div :style="[
    {
      width: `${props.width}px`,
      height: `${props.height}px`,
      pointerEvents: 'auto',
      backgroundColor: 'darkcyan'
    }
  ]">
    <div>
      <span>{{ props.data.title }}</span>
      <button @click="hideClicked()" v-if="props.data.canHide">_</button>
      <button @click="closeClicked()" v-if="props.data.canClose">X</button>
    </div>

    <div v-for="option in props.data.options">
      <button @click="() => optionClicked(option)">{{ option.title }}</button>
    </div>

  </div>

</template>
