import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore('user', () => {
  const name = ref(window.localStorage.getItem("name") ?? "urod");
  const key = ref(window.localStorage.getItem("key"));

  function setName(newName: string) {
    name.value = newName;
    window.localStorage.setItem("name", newName);
  }

  function setKey(newKey: string) {
    key.value = newKey;
    window.localStorage.setItem("key", newKey);
  }

  return { name, key, setName, setKey };
});
