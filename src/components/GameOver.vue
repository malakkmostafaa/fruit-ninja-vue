<template>
  <div class="game-over">
    <h2 v-if="won">🎉 You Win! 🎉</h2>
    <h2 v-else>💥 Game Over 💥</h2>

    <p>Final Score: {{ score }}</p>
    <button @click="restart">Play Again</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const score = computed(() => store.state.score)
const target = computed(() => store.state.levelTargets[store.state.level])
const won = computed(() => score.value >= target.value)

function restart() {
  store.commit('resetGame')
}
</script>

<style scoped>
.game-over {
  margin-top: 5rem;
  background: #ffeaa7;
  padding: 2rem;
  border-radius: 15px;
  display: inline-block;
}
button {
  background: #55efc4;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  border-radius: 10px;
  margin-top: 1rem;
  cursor: pointer;
}
button:hover {
  background: #00cec9;
  color: white;
}
</style>
