<template>
  <div id="app" class="app-container">
    <h1 class="title">🍉 Fruit Ninja Vue 🍌</h1>

    <LevelSelector v-if="!gameStarted" />
    <div v-else-if="!gameOver">
      <ScoreBoard />
      <GameCanvas />
    </div>
    <GameOver v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import LevelSelector from './components/LevelSelector.vue'
import ScoreBoard from './components/ScoreBoard.vue'
import GameCanvas from './components/GameCanvas.vue'
import GameOver from './components/GameOver.vue'

const store = useStore()
const gameStarted = computed(() => store.state.gameStarted)
const gameOver = computed(() => store.state.gameOver)
</script>

<style scoped>
.app-container {
  text-align: center;
  background: radial-gradient(circle at top, #ffeaa7, #fab1a0);
  min-height: 100vh;
  padding: 1rem;
  overflow: hidden;
}
.title {
  font-family: 'Comic Sans MS', sans-serif;
  font-size: 2.5rem;
  color: #2d3436;
}
</style>
