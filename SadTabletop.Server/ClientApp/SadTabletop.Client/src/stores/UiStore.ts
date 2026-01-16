import { defineStore } from "pinia";
import { ref } from "vue";

const titlesHeight = ref(24);

export const useUiStore = defineStore('ui', () => {
  return { titlesHeight };
});
