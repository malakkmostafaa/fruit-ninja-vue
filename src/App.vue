<template>
  <div id="app" class="app-container">
    <LevelSelector v-if="!gameStarted" />

    <div v-else-if="!gameOver" class="game-layout">
      <ScoreBoard />
      <GameCanvas />
    </div>

    <GameOver v-else />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import LevelSelector from "./components/LevelSelector.vue";
import ScoreBoard from "./components/ScoreBoard.vue";
import GameCanvas from "./components/GameCanvas.vue";
import GameOver from "./components/GameOver.vue";

const store = useStore();
const gameStarted = computed(() => store.state.gameStarted);
const gameOver = computed(() => store.state.gameOver);
</script>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  background: linear-gradient(180deg, #012b18, #024f2e, #046940);
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: cover;
  font-family: 'Trebuchet MS', sans-serif;
}

.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
}

.game-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 900px;
}
</style>
