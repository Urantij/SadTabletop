<script setup lang="ts">
import LeGame from '@/actual/LeGame';
import Renderer from '@/actual/render/Renderer';
import Connection from '@/communication/Connection';
import UiContainer from '@/components/UiContainer.vue';
import { useUserStore } from '@/stores/UserStore';
import { onMounted } from 'vue';

const userStore = useUserStore();

const divId = "taskete";

const connection = new Connection(`${window.location.host}/ws`);

const leGame = new LeGame();

const renderer = new Renderer(leGame, window.innerWidth, window.innerHeight, divId);

onMounted(async () => {

    {
        const name = localStorage.getItem("name");
        if (name !== null) {
            userStore.setName(name);
        }
    }

    connection.events.once("MeJoined", (data) => {

        for (const entity of data.entities) {
            if (["Card", "Dice", "Deck"].includes(entity.type)) {
                leGame.table.addEntity(entity);
            }
            else {
                console.log(`непонятный ентити ${entity.type}`);
            }
        }

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
            <UiContainer></UiContainer>
        </div>
    </main>
</template>

<style>
body {
    overflow: hidden;
}
</style>