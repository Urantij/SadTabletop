<script setup lang="ts">
import LeGame from '@/actual/LeGame';
import Renderer from '@/actual/render/Renderer';
import Connection from '@/communication/Connection';
import type ChangeNameMessage from '@/communication/messages/client/ChangeNameMessage';
import UiContainer from '@/components/UiContainer.vue';
import { useUserStore } from '@/stores/UserStore';
import { onMounted, ref } from 'vue';

const userStore = useUserStore();

const divId = "taskete";

const connection = new Connection(`${window.location.host}/ws`);

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
        'top': '0px'
      }
    ]" :id="divId">
      <UiContainer :draw="draw" :game="leGame"></UiContainer>
    </div>
  </main>
</template>

<style>
body {
  overflow: hidden;
}
</style>
