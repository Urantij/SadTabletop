<script setup lang="ts">
import type LeGame from '@/actual/LeGame';
import type Player from '@/actual/things/Player';
import { onMounted, onUnmounted, ref, shallowReactive } from 'vue';
import PlayerPlate from './PlayerPlate.vue';
import { removeItemFromCollection } from '@/utilities/MyCollections';
import { usePopitStore } from '@/stores/PopitStore';
import type PopitOption from './PopitOption';
import connectionInstance from '@/communication/ConnectionDva';
import type TakeSeatMessage from '@/communication/messages/client/TakeSeatMessage';

const popitStore = usePopitStore();

const props = defineProps<{
  game: LeGame
}>();

const plateWidth = ref(200);
const plateHeight = ref(75);

const players = shallowReactive<Player[]>([]);

onMounted(() => {
  for (const player of props.game.playersContainer.players) {
    players.push(player);
  }

  props.game.playersContainer.events.on("PlayerAdded", playerAdded, this);
  props.game.playersContainer.events.on("PlayerRemoved", playerRemoved, this);
});

onUnmounted(() => {
  props.game.playersContainer.events.off("PlayerAdded", playerAdded, this);
  props.game.playersContainer.events.off("PlayerRemoved", playerRemoved, this);
});

function playerAdded(player: Player) {
  players.push(player);
}
function playerRemoved(player: Player) {
  removeItemFromCollection(players, player);
}

function playerClicked(player: Player) {
  if (player === props.game.ourPlayer) {

    const options: PopitOption[] = props.game.bench.seats
      .filter(s => !props.game.playersContainer.isSeatBusy(s))
      .map<PopitOption>(seat => {
        return {
          title: seat.color.toString(),
          callback: () => {

            if (props.game.playersContainer.isSeatBusy(seat)) {
              return;
            }

            const message: TakeSeatMessage = {
              seatId: seat.id
            };

            connectionInstance.sendMessage("TakeSeatMessage", message);
          }
        };
      });

    if (props.game.ourPlayer.seat !== null) {
      options.push({
        title: "слезть",
        callback: () => {
          if (props.game.ourPlayer?.seat === null)
            return;

          const message: TakeSeatMessage = {
            seatId: null
          };

          connectionInstance.sendMessage("TakeSeatMessage", message);
        }
      });
    }

    popitStore.addPopit("Выбираешь стул?", options, false, true);
  }
}
</script>

<template>
  <div style="pointer-events: auto;">
    <PlayerPlate v-for="player in players" :game="props.game" :player="player"
      v-on:left-click="() => playerClicked(player)" :width="plateWidth" :height="plateHeight" />
  </div>
</template>
