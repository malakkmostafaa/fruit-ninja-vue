<template>
  <div class="level-selector">
    <h2>Select Level</h2>
    <button @click="startGame">Start Game</button>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
const store = useStore()

function startGame() {
  store.dispatch('startLevel')
}
</script>

<style scoped>
.level-selector {
  margin-top: 3rem;
}
button {
  background: #55efc4;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.3s;
}
button:hover {
  background: #00cec9;
  color: white;
}
</style>
