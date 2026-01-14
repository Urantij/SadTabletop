<script setup lang="ts">
import { useChatStore } from '@/stores/ChatStore';
import type ChatWiwdowData from './ChatWiwdowData';
import type ChatMessage from '@/actual/things/concrete/Chat/ChatMessage';
import DumbWindow from '../DumbWindow.vue';
import { reactive } from 'vue';

const chatStore = useChatStore();

const displayMessages: ChatMessage[] = reactive([]);

const props = defineProps<{
  data: ChatWiwdowData
}>();

chatStore.$onAction(({
  name, args, after
}) => {
  if (name !== "addMessage")
    return;

  after((result) => {
    const msg = args[0];
    addMessage(msg);
  });
});

function addMessage(msg: ChatMessage) {
  displayMessages.push(msg);
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
        'width': props.data.width,
        'height': props.data.height,
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
    <button v-on:click="() => bClicked()">ы</button>
  </DumbWindow>
</template>

<style>
.mesage {
  padding-left: 10px;
}
</style>
