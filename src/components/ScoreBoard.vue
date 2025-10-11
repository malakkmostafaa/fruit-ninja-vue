<template>
  <div class="scoreboard">
    <div>❤️ Lives: {{ lives }}</div>
    <div>💯 Score: {{ score }}</div>
    <div>⏱️ Time: {{ timer }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const score = computed(() => store.state.score)
const lives = computed(() => store.state.lives)
const timer = computed(() => store.state.timer)
</script>

<style scoped>
.scoreboard {
  display: flex;
  justify-content: space-around;
  background: #ffeaa7;
  border-radius: 10px;
  padding: 0.5rem;
  font-size: 1.2rem;
  margin-bottom: 10px;
}
</style>
