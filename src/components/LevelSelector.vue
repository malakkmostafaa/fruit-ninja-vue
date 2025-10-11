<template>
  <div class="start-screen">
    <div class="overlay"></div>

    <!-- Game Logo -->
    <div class="logo-container">
      <img src="/fruit-logo.png" alt="Fruit Ninja Logo" class="game-logo" />
    </div>

    <!-- Pineapple Split Button -->
    <div class="pineapple-container" @click="startGame">
      <div class="pineapple">
        <img src="/pineapple-right.png" alt="Left Half" class="pineapple-left" />
        <img src="/pineapple-left.png" alt="Right Half" class="pineapple-right" />
      </div>
      <span class="start-text">Start Game ▶</span>
    </div>
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
.start-screen {
  position: relative;
  width: 100%;
  height: 100vh;
  background: url('/fruit-bg.png') center/cover no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 0;
}

.logo-container {
  z-index: 1;
  text-align: center;
  margin-bottom: 3rem;
}
.game-logo {
  width: 450px;
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));
}

/* === Pineapple Split Animation === */
.pineapple-container {
  position: relative;
  cursor: pointer;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pineapple {
  position: relative;
  width: 180px;
  height: 180px;
  transition: all 0.4s ease;
}

.pineapple-left,
.pineapple-right {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  transform: scaleX(-1);
  transition: all 0.6s ease;
 
}

/* Tighter alignment — halves now touch */
.pineapple-left {
  left: 0;
  transform-origin: right center;
  transform: scaleX(-1);
}

.pineapple-right {
  right: 0;
  transform-origin: left center;
}


/* Hidden Start Text initially */
.start-text {
  position: absolute;
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  opacity: 0;
  transform: scale(0.9);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  transition: all 0.4s ease;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
}

/* Hover effect — splits open + reveals text */
.pineapple-container:hover .pineapple-left {
  transform: rotate(-20deg) translateX(100px);
}
.pineapple-container:hover .pineapple-right {
  transform: rotate(20deg) translateX(-100px);
}
.pineapple-container:hover .start-text {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

/* Small bounce */
.pineapple-container:hover .pineapple {
  animation: bounce 0.8s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
button:hover{ transform: translateY(-1px); filter:saturate(1.06) }
button:active{ transform: translateY(1px) }
</style>


