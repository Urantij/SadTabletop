<script setup lang="ts">
import type LeGame from '@/actual/LeGame';
import { usePopitStore } from '@/stores/PopitStore';
import { ref, watch } from 'vue';
import type HintData from './HintData';

const props = defineProps<{
  game: LeGame,
}>();

const display = ref<HintData | null>(null);

const popit = usePopitStore();

watch(popit.hints, () => {
  if (popit.hints.length === 0) {

    if (display.value !== null)
      display.value = null;
    return;
  }

  const last = popit.hints[popit.hints.length - 1];

  if (last === display.value)
    return;

  display.value = last;
});

</script>

<template>
  <div class="hintContainer" v-if="display != null">
    <span class="hintText">{{ display.text }}</span>
  </div>
</template>

<style>
.hintContainer {
  width: 100%;
  height: 100%;
  background-color: rgba(169, 169, 169, 0.301);
  justify-self: center;
  display: flex;
  justify-content: center;
}

.hintText {
  color: white;
  align-content: center;
}
</style>
