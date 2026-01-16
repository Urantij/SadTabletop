<script setup lang="ts">
import LeGame from '@/actual/LeGame';
import Renderer from '@/actual/render/Renderer';
import connectionInstance from '@/communication/ConnectionDva';
import type ChangeNameMessage from '@/communication/messages/client/ChangeNameMessage';
import type MoveCursorMessage from '@/communication/messages/client/MoveCursorMessage';
import type HintData from '@/components/HintData';
import UiContainer from '@/components/UiContainer.vue';
import { useChatStore } from '@/stores/ChatStore';
import { usePopitStore } from '@/stores/PopitStore';
import { useRendererStore } from '@/stores/RendererStore';
import { useUserStore } from '@/stores/UserStore';
import ContextMenu, { type MenuItem } from '@imengyu/vue3-context-menu';
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue';

const uicontainer = useTemplateRef("uicontainer");

const userStore = useUserStore();
const popitStore = usePopitStore();
const rendererStore = useRendererStore();
const chatStore = useChatStore();

const divId = "taskete";

const connection = connectionInstance;

const draw = ref(false);

const leGame = new LeGame();
leGame.subscribeToConnection(connection);

leGame.chatts.events.on("NewMessageAppeared", (msg) => {
  chatStore.addMessage(msg);
});
leGame.chatts.events.on("Reset", (msg) => {
  chatStore.reset(msg);
});

const gameRenderer = new Renderer(leGame, window.innerWidth, window.innerHeight, divId);

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

chatStore.$onAction(({
  name, args, after
}) => {
  if (name !== "sendMessage")
    return;

  after((result) => {

    const content = args[0];

    leGame.chatts.sendMessage(content);
  });
});

gameRenderer.events.on("ClickyClicked", (entity) => {

  // здесь должна быть система ивентов
  // но мне лень
  leGame.table.clicks.clickyClicked(entity);
});

let lastCursorPos: Phaser.Math.Vector2 | null = null;
let lastSentPos: Phaser.Math.Vector2 | null = null;
gameRenderer.events.on("CursorMoved", (pos) => {
  // кстати там наноизменения ещё бывают. если не раундить, всё равно до какой то точки лучше смотреть
  lastCursorPos = new Phaser.Math.Vector2(Math.round(pos.x), Math.round(pos.y));
});

let hoverHint: HintData | null = null;
onMounted(async () => {

  {
    const name = localStorage.getItem("name");
    if (name !== null) {
      userStore.setName(name);
    }
  }

  connection.events.once("MeJoined", () => {
    gameRenderer.initAsync().then(() => {

      rendererStore.setRender(gameRenderer.scene!.cardRender);

      draw.value = true;
      gameRenderer.scene!.myEvents.on("DescriptionRequired", (obj) => {
        if (hoverHint !== null) {
          popitStore.removeHint(hoverHint);
          hoverHint = null; // просто так
        }

        hoverHint = popitStore.addHint(obj.gameObject.description!);
      });
      gameRenderer.scene!.myEvents.on("DescriptionNotNeeded", (obj) => {
        if (hoverHint === null)
          return;

        popitStore.removeHint(hoverHint);
        hoverHint = null;
      });
      gameRenderer.scene!.myEvents.on("DeckRightClicked", (pointer, obj) => {
        // не нужно кстати
        pointer.event.preventDefault();

        let items: MenuItem[] = [];
        if (obj.gameObject.cards !== null && obj.gameObject.cardsCount > 0) {
          items.push({
            label: "Посмотреть",
            onClick: () => {
              uicontainer.value?.showCardsMenu(obj.gameObject);
            }
          });
        }

        if (obj.clicky) {
          items.push({
            label: "Нажать",
            onClick: () => {
              leGame.table.clicks.clickyClicked(obj.gameObject);
            }
          });
        }

        items.push({
          label: `Карт: ${obj.gameObject.cardsCount}`,
          disabled: true
        });

        ContextMenu.showContextMenu({
          x: pointer.x,
          y: pointer.y,
          items: items
        });
      });

      leGame.cardSelection.events.on("EntityAdded", (selection) => {

        if (uicontainer.value == undefined)
          return;

        if (selection.target !== leGame.ourPlayer?.seat)
          return;

        uicontainer.value.openCardsSelection(selection.cards, selection.minSelect, selection.maxSelect, (selected) => {
          leGame.cardSelection.sendSelection(selection, selected);
        });
      });
    });

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

        connection.sendMessage("MoveCursorMessage", message);
      }
    }, 100);
  });

  console.log(`стартуем конекшен...`);
  connection.start();

  leGame.hints.events.on("NewHint", hintChanged, this);
  leGame.events.on("Clearing", clearing, this);
});

onUnmounted(() => {
  leGame.hints.events.off("NewHint", hintChanged, this);
  leGame.events.off("Clearing", clearing, this);
});

let seatHint: HintData | null = null;
function hintChanged(hint: string | null) {
  let newHintData: HintData | null = null;
  if (hint !== null) {
    newHintData = popitStore.addHint(hint);
  }

  if (seatHint !== null) {
    popitStore.removeHint(seatHint);
  }

  seatHint = newHintData;
}

function clearing() {
  popitStore.hints.splice(0);
}

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
      <UiContainer ref="uicontainer" v-if="draw" :draw="draw" :game="leGame">
      </UiContainer>
    </div>
  </main>
</template>

<style>
body {
  overflow: hidden;
}
</style>
