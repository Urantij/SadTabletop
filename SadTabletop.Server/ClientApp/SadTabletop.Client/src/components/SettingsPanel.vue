<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore';
import { ref, useTemplateRef } from 'vue';
import DumbWindow from './DumbWindow.vue';

const userStore = useUserStore();

const name = ref(userStore.name);

const nameInput = useTemplateRef("nameInput");

const emits = defineEmits<{
  "CloseMe": []
}>();

function closeClicked() {
  emits("CloseMe");
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
  ]" :title="'Настройки'" :can-hide="false" :can-close="true" v-on:close-me="closeClicked()">
    <button style="pointer-events: auto;" v-on:click="() => closeClicked()">X</button>
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
