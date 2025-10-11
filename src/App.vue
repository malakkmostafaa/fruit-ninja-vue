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
  text-align: center;
  min-height: 100vh;

  overflow: hidden;

  /* playful gradient sky */
  
  
}

.title {
  font-family: system-ui, "Comic Sans MS", "Comic Sans", ui-rounded, sans-serif;
  font-size: clamp(28px, 4.2vw, 44px);
  color: #2d3436;
  margin: 10px 0 14px;
  letter-spacing: .3px;
  text-shadow: 0 4px 18px rgba(255, 166, 158, .35);
}
</style>
