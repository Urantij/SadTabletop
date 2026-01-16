<script setup lang="ts">
import { useChatStore } from '@/stores/ChatStore';
import type ChatWiwdowData from './ChatWiwdowData';
import type ChatMessage from '@/actual/things/concrete/Chat/ChatMessage';
import DumbWindow from '../DumbWindow.vue';
import { onMounted, reactive, ref } from 'vue';
import { useUiStore } from '@/stores/UiStore';

const uiStore = useUiStore();
const chatStore = useChatStore();

const botHeight = ref(22);

const displayMessages: ChatMessage[] = reactive([]);

const props = defineProps<{
  data: ChatWiwdowData
}>();

onMounted(() => {
  const msgs = chatStore.get();
  displayMessages.push(...msgs);
});

chatStore.$onAction(({
  name, args, after
}) => {
  if (name === "addMessage") {
    after((result) => {
      const msg = args[0];
      addMessage(msg);
    });
  }
  else if (name === "reset") {
    after((result) => {
      const msgs = args[0];
      reset(msgs);
    });
  }
});

function addMessage(msg: ChatMessage) {
  displayMessages.push(msg);
}

function reset(msgs: ChatMessage[]) {
  displayMessages.splice(0, displayMessages.length, ...msgs);
}

function bClicked() {
  const input = prompt("ну?");

  if (input == null)
    return;

  chatStore.sendMessage(input);
}
</script>

<template>
  <DumbWindow :data="props.data">
    <div :style="[
      {
        'display': 'flex',
        'flex-wrap': 'wrap',
        'flex-direction': 'column',
        'justify-content': 'flex-start',
        'overflow-y': 'scroll',
        'overflow-x': 'hidden',
        'width': `${props.data.width}px`,
        'height': `${props.data.height - uiStore.titlesHeight - botHeight}px`,
      }
    ]">
      <template v-for="msg in displayMessages">
        <div class="mesage">
          <span :style="[
            {
              color: msg.color
            }
          ]">{{ msg.name }}</span><span>: </span><span>{{ msg.content.content }}</span>
        </div>
      </template>
    </div>
    <div :style="[{
      'width': `${props.data.width}px`,
      'height': `${botHeight}px`
    }]">
      <button v-on:click="() => bClicked()">ы</button>
    </div>
  </DumbWindow>
</template>

<style>
.mesage {
  padding-left: 10px;
}
</style>
