<template>
  <div id="app" class="app-container">
    

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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  background: linear-gradient(to bottom, #fff6e5, #ffeae0);
  padding: 2rem;
}
.title {
  font-size: 2.2rem;
  font-weight: bold;
  color: #2f1c0e;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
}
</style>
