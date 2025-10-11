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
.scoreboard{
  display:flex; justify-content:space-between; align-items:center;
  gap:12px; padding:10px 14px; margin:10px auto 16px; max-width:980px;
  border-radius:14px; color:#2b2116; font-weight:700; letter-spacing:.2px;

  background: linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.55));
  border:1px solid rgba(0,0,0,.12);
  box-shadow: 0 12px 22px rgba(0,0,0,.12);
}
.scoreboard > div{
  flex:1; text-align:center; padding:8px 10px; border-radius:10px;
  background: rgba(255,255,255,.35); border:1px solid rgba(0,0,0,.10);
}
.scoreboard > div:first-child{ filter: drop-shadow(0 0 6px rgba(255,77,109,.25)); }
</style>

