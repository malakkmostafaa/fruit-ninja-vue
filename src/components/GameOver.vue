<template>
  <div class="game-over">
    <div class="overlay-card">
      <h2 v-if="won" class="title win">🎉 You Win! 🎉</h2>
      <h2 v-else class="title lose">💥 Game Over 💥</h2>

      <p class="final-score">Final Score: <span>{{ score }}</span></p>

      <button class="restart-btn" @click="restart">
        🔁 Play Again
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { sfx } from '../game/audio'

const store = useStore()
const score = computed(() => store.state.score)
const target = computed(() => store.state.levelTargets[store.state.level])
const won = computed(() => score.value >= target.value)

function restart() {
  store.commit('resetGame')
}


onMounted(() => {
  if (won.value) {
    sfx.win.play()
    navigator.vibrate?.(120)
  } else {
    sfx.lose.play()
    navigator.vibrate?.([60, 40, 120])
  }
})
</script>

<style scoped>
.game-over {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at 50% 40%, rgba(0, 40, 25, 0.95), rgba(0, 20, 10, 0.95));
  backdrop-filter: blur(4px);
  z-index: 20;
}

.overlay-card {
  background: linear-gradient(180deg, rgba(0, 70, 40, 0.9), rgba(0, 40, 20, 0.9));
  border: 1px solid rgba(0, 255, 140, 0.15);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4),
              inset 0 0 12px rgba(0, 255, 100, 0.12);
  border-radius: 18px;
  padding: 2.5rem 3rem;
  text-align: center;
  color: #e9ffe9;
  width: 420px;
  animation: fadeIn 0.6s ease;
}

.title {
  margin: 0 0 1rem;
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.win {
  color: #7aff9d;
  text-shadow: 0 0 15px rgba(0, 255, 160, 0.4);
}
.lose {
  color: #ff9f9f;
  text-shadow: 0 0 15px rgba(255, 120, 120, 0.4);
}

.final-score {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #caffd2;
}
.final-score span {
  color: #7affb5;
  font-size: 1.4rem;
}

.restart-btn {
  background: linear-gradient(180deg, #39ff90, #22c55e);
  color: #042210;
  font-weight: 800;
  border: none;
  border-radius: 12px;
  padding: 0.85rem 1.8rem;
  font-size: 1.05rem;
  cursor: pointer;
  letter-spacing: 0.5px;
  box-shadow: 0 10px 25px rgba(0, 255, 140, 0.35);
  transition: all 0.15s ease;
}
.restart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 35px rgba(0, 255, 140, 0.45);
}
.restart-btn:active {
  transform: translateY(1px);
  filter: brightness(0.95);
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
