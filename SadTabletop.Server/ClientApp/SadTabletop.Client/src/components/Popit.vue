<script setup lang="ts">
import DumbWindow from './DumbWindow.vue';
import type PopitData from './PopitData';
import type PopitOption from './PopitOption';

const props = defineProps<{
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
  <DumbWindow :data="props.data" v-on:close-me="closeClicked()" v-on:hide-me="hideClicked()">
    <div v-for="option in props.data.options">
      <button @click="() => optionClicked(option)">{{ option.title }}</button>
    </div>
  </DumbWindow>
</template>
