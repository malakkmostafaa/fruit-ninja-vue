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
.level-selector{ margin-top:2.6rem; display:grid; place-items:center; gap:14px; }
.level-selector h2{
  margin:0 0 6px; font-size:1.6rem; letter-spacing:.3px; color:#2b2116;
  text-shadow:0 6px 18px rgba(0,0,0,.12);
}
button{
  background: linear-gradient(180deg, #39c46f, #2aa85d);
  color:#0b0f14; font-weight:800; border:0; border-radius:12px;
  padding:1rem 2rem; font-size:1.05rem; cursor:pointer;
  box-shadow: 0 14px 32px rgba(42,168,93,.35), inset 0 0 0 1px rgba(0,0,0,.2);
  transition: transform .12s ease, filter .12s ease;
}
button:hover{ transform: translateY(-1px); filter:saturate(1.06) }
button:active{ transform: translateY(1px) }
</style>


