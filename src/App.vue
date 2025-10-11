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
  min-height: 100vh;
  padding: 1rem;
  overflow: hidden;

  /* playful gradient sky */
  background:
    radial-gradient(1200px 700px at 15% -10%, #ffeaa7 0%, rgba(255,234,167,0) 55%),
    radial-gradient(1100px 600px at 120% 110%, #fab1a0 0%, rgba(250,177,160,0) 55%),
    linear-gradient(180deg, #fff6e9, #ffe3d8 55%, #ffd5c6);
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
