<template>
  <div class="scoreboard">
    <div class="lives">❤️ Lives: {{ lives }}</div>
    <div class="score">💯 Score: {{ score }}</div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();
const score = computed(() => store.state.score);
const lives = computed(() => store.state.lives);
</script>

<style scoped>
.scoreboard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  margin: 16px auto 20px;
  max-width: 840px;
  border-radius: 14px;

  background: linear-gradient(180deg, rgba(0, 60, 35, 0.85), rgba(0, 40, 25, 0.8));
  border: 1px solid rgba(0, 255, 140, 0.15);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
  color: #e8ffe9;
  font-weight: 700;
  letter-spacing: 0.3px;
  font-size: 1.1rem;
}

.scoreboard > div {
  flex: 1;
  text-align: center;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(0, 80, 40, 0.25);
  border: 1px solid rgba(0, 255, 120, 0.12);
}

/* small distinction */
.lives {
  color: #f5a5a5;
}
.score {
  color: #b2ffcf;
}
</style>
