<template>
  <div class="game-over">
    <h2 v-if="won">🎉 You Win! 🎉</h2>
    <h2 v-else>💥 Game Over 💥</h2>

    <p>Final Score: {{ score }}</p>
    <button @click="restart">Play Again</button>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const score = computed(() => store.state.score)
const target = computed(() => store.state.levelTargets[store.state.level])
const won = computed(() => score.value >= target.value)

function restart() {
  store.commit('resetGame')
}
// 🔊 Play outcome sound (Web Audio API)
function playOutcome(){
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return
  const ctx = new AudioCtx()
  if (won.value) playWin(ctx)
  else playLose(ctx)
}

function beep(ctx, freq, t0, dur = 0.25, type = 'sine', peak = 0.3){
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.value = freq
  o.connect(g); g.connect(ctx.destination)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.start(t0); o.stop(t0 + dur + 0.02)
}

function playWin(ctx){
  const now = ctx.currentTime
  // simple triumphant arpeggio: C5–E5–G5
  beep(ctx, 523.25, now + 0.00, 0.22, 'sine', 0.28)
  beep(ctx, 659.25, now + 0.12, 0.22, 'sine', 0.28)
  beep(ctx, 783.99, now + 0.24, 0.26, 'sine', 0.32)
}

function playLose(ctx){
  const now = ctx.currentTime
  // descending buzz: 200→80 Hz
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = 'sawtooth'
  o.connect(g); g.connect(ctx.destination)
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(0.35, now + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)
  o.frequency.setValueAtTime(200, now)
  o.frequency.exponentialRampToValueAtTime(80, now + 0.4)
  o.start(now); o.stop(now + 0.5)
}

onMounted(playOutcome)
watch(won, () => playOutcome())  // if the computed flips, play again
</script>

<style scoped>
.game-over{
  margin-top:4.2rem; display:inline-grid; gap:10px; color:#2b2116;
  background: linear-gradient(180deg, rgba(255,255,255,.85), rgba(255,255,255,.65));
  border:1px solid rgba(0,0,0,.14);
  padding:2rem 2.2rem; border-radius:18px;
  box-shadow: 0 22px 50px rgba(0,0,0,.18);
}
.game-over h2{ margin:0 0 6px; letter-spacing:.4px; text-shadow:0 6px 20px rgba(0,0,0,.12); }
.game-over p{ margin:.2rem 0 0; font-weight:700; }
button{
  background: linear-gradient(180deg, #39c46f, #2aa85d);
  color:#0b0f14; font-weight:800; border:0; border-radius:12px;
  padding:.85rem 1.6rem; font-size:1.05rem; margin-top:12px; cursor:pointer;
  box-shadow: 0 12px 28px rgba(42,168,93,.35), inset 0 0 0 1px rgba(0,0,0,.25);
  transition: transform .12s ease, filter .12s ease;
}
button:hover{ transform: translateY(-1px); filter:saturate(1.06) }
button:active{ transform: translateY(1px) }
</style>
