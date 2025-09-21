<script setup lang="ts">
import LeGame from '@/actual/LeGame';
import Renderer from '@/actual/render/Renderer';
import connectionInstance from '@/communication/ConnectionDva';
import type ChangeNameMessage from '@/communication/messages/client/ChangeNameMessage';
import type MoveCursorMessage from '@/communication/messages/client/MoveCursorMessage';
import UiContainer from '@/components/UiContainer.vue';
import { useUserStore } from '@/stores/UserStore';
import { onMounted, ref, useTemplateRef } from 'vue';

const uicontainer = useTemplateRef("uicontainer");

const userStore = useUserStore();

const divId = "taskete";

const connection = connectionInstance;

const draw = ref(false);

const leGame = new LeGame();
leGame.subscribeToConnection(connection);

const renderer = new Renderer(leGame, window.innerWidth, window.innerHeight, divId);

userStore.$onAction(({
  name, args, after
}) => {
  if (name !== "setName")
    return;

  after((result) => {

    const message: ChangeNameMessage = {
      newName: args[0]
    };

    connection.sendMessage("ChangeNameMessage", message);
  });
});

renderer.events.on("ClickyClicked", (entity) => {

  // здесь должна быть система ивентов
  // но мне лень
  leGame.table.clicks.clickyClicked(entity);
});

let lastCursorPos: Phaser.Math.Vector2 | null = null;
let lastSentPos: Phaser.Math.Vector2 | null = null;
renderer.events.on("CursorMoved", (pos) => {
  // кстати там наноизменения ещё бывают. если не раундить, всё равно до какой то точки лучше смотреть
  lastCursorPos = new Phaser.Math.Vector2(Math.round(pos.x), Math.round(pos.y));
});

onMounted(async () => {

  {
    const name = localStorage.getItem("name");
    if (name !== null) {
      userStore.setName(name);
    }
  }

  connection.events.once("MeJoined", () => {
    draw.value = true;
    renderer.initAsync();

    // TODO кабуиабы моджно найти место получше
    setInterval(() => {
      if (lastCursorPos === null)
        return;

      if (lastSentPos === null || !lastCursorPos.equals(lastSentPos)) {

        const message: MoveCursorMessage = {
          x: lastCursorPos.x,
          y: lastCursorPos.y,
        };

        lastSentPos = lastCursorPos;

        console.log(lastSentPos);

        connection.sendMessage("MoveCursorMessage", message);
      }
    }, 1000);
  });

  console.log(`стартуем конекшен...`);
  connection.start();
});

</script>

<template>
  <main>
    <div :style="[
      {
        'position': 'absolute',
        'left': '0px',
        'top': '0px',
        // pointerEvents: 'none'
      }
    ]" :id="divId">
      <UiContainer ref="uicontainer" :draw="draw" :game="leGame"></UiContainer>
    </div>
  </main>
</template>

<style>
body {
  overflow: hidden;
}
</style>
