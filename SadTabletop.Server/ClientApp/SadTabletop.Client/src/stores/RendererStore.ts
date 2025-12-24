import type CardRenderManager from "@/actual/render/CardRenderManager";
import { defineStore } from "pinia";
import { shallowRef, type ShallowRef } from "vue";

export const useRendererStore = defineStore('renderer', () => {

  const renderer: ShallowRef<CardRenderManager | null> = shallowRef(null);

  function setRender(rende: CardRenderManager) {
    renderer.value = rende;
  }

  return { renderer, setRender };
});
