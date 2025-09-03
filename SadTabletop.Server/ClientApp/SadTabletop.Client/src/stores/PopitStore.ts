import type PopitData from "@/components/PopitData";
import type PopitOption from "@/components/PopitOption";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";

export const usePopitStore = defineStore('popit', () => {

  const arr: Ref<PopitData[]> = ref([]);

  function addPopit(title: string, options: PopitOption[], canHide: boolean = true, canClose: boolean = true) {

    const data: PopitData = {
      title: title,
      options: options,
      canHide: canHide,
      canClose: canClose
    };

    arr.value.push(data);
  }

  return { arr, addPopit };
});
