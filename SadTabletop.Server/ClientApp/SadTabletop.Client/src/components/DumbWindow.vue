<script setup lang="ts">
const props = defineProps<{
  title: string | undefined,
  canHide: boolean,
  canClose: boolean
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
      pointerEvents: 'auto',
      backgroundColor: 'darkcyan'
    }
  ]">
    <div>
      <span v-if="props.title !== undefined">{{ props.title }}</span>
      <button @click="hideClicked()" v-if="props.canHide">_</button>
      <button @click="closeClicked()" v-if="props.canClose">X</button>
    </div>
    <div>
      <slot></slot>
    </div>
  </div>
</template>
