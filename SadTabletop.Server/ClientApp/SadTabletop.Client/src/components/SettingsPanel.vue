<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore';
import { ref, useTemplateRef } from 'vue';

const userStore = useUserStore();

const name = ref(userStore.name);

const nameInput = useTemplateRef("nameInput");

const props = defineProps<{
  width: number,
  height: number,
}>();

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
  <div :style="[
    {
      width: `${props.width}px`,
      height: `${props.height}px`,
      pointerEvents: 'auto',
      backgroundColor: 'darkgray'
    }
  ]">
    <span>Настройки</span>
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
  </div>
</template>
