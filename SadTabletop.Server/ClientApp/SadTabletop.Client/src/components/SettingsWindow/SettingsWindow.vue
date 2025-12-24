<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore';
import { ref, useTemplateRef } from 'vue';
import DumbWindow from '../DumbWindow.vue';
import type SettingsWiwdowData from './SettingsWiwdowData';

const userStore = useUserStore();

const name = ref(userStore.name);

const nameInput = useTemplateRef("nameInput");

const props = defineProps<{
  data: SettingsWiwdowData
}>();

const emits = defineEmits<{
  "closeMe": []
}>();

function closeClicked() {
  emits("closeMe");
}

function changeNameClicked() {
  if (nameInput.value === null)
    return;

  userStore.setName(nameInput.value.value);
}

</script>

<template>
  <DumbWindow :style="[
    {
      backgroundColor: 'darkgray'
    }
  ]" :data="data" v-on:close-me="closeClicked()">
    <div>
      <span>Name:</span>
      <input ref="nameInput" :value="name" type="text"></input>
      <button v-on:click="() => changeNameClicked()">change</button>
    </div>
    <div>
      <span>лангуае</span>
      <input>рофлан ебало</input>
    </div>
  </DumbWindow>
</template>
