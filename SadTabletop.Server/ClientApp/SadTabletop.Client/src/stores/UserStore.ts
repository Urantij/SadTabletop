import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore('user', () => {
  const name = ref('urod');
  const key = ref('123');

  function setName(newName: string) {
    name.value = newName;
  }

  function setKey(newKey: string) {
    key.value = newKey;
  }

  return { name, key, setName, setKey };
});
