<template>
  <div class="game-wrapper">
    <div class="level-banner">Level {{ level }}</div>

    <div class="game-canvas" @click="handleClick">
      <!-- Fruits -->
      <div
        v-for="fruit in fruits"
        :key="fruit.id"
        class="fruit"
        :style="{ left: fruit.x + 'px', top: fruit.y + 'px' }"
      >
        {{ fruit.icon }}
      </div>

      <!-- Bombs -->
      <div
        v-for="bomb in bombs"
        :key="bomb.id"
        class="bomb"
        :style="{ left: bomb.x + 'px', top: bomb.y + 'px' }"
      >
        💣
      </div>

      <!-- Level Complete Overlay -->
      <div v-if="levelComplete && !gameOver" class="overlay">
        <h2>🎯 Level {{ level }} Complete!</h2>
        <button @click="nextLevel">Next Level ▶</button>
      </div>

      <!-- Custom Cursor -->
      <div
        v-show="!gameOver"
        class="cursor-blade"
        :style="{ left: cursorX + 'px', top: cursorY + 'px' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useStore } from "vuex";

const store = useStore();
const fruits = computed(() => store.state.fruits);
const bombs = computed(() => store.state.bombs);
const level = computed(() => store.state.level);
const score = computed(() => store.state.score);
const gameOver = computed(() => store.state.gameOver);

let physicsLoop, spawnLoop;
const levelComplete = ref(false);

// 🖱️ Custom Cursor
const cursorX = ref(0);
const cursorY = ref(0);

// ==============================
// Level Configurations
// ==============================
const LEVEL_CONFIG = {
  1: { fruitSpeed: 8, gravity: 0.35, spawnRate: 1100, target: 100, bombs: false },
  2: { fruitSpeed: 8, gravity: 0.35, spawnRate: 950, target: 250, bombs: true },
  3: { fruitSpeed: 8, gravity: 0.35, spawnRate: 800, target: 400, bombs: true },
};

function getLevelSettings() {
  return LEVEL_CONFIG[store.state.level];
}

// ==============================
// Motion Physics
// ==============================
function updatePositions() {
  const { gravity } = getLevelSettings();

  for (const fruit of [...fruits.value]) {
    fruit.x += fruit.vx;
    fruit.y += fruit.vy;
    fruit.vy += gravity;
    if (fruit.y > 620) store.commit("missFruit", fruit.id);
  }

  for (const bomb of [...bombs.value]) {
    bomb.x += bomb.vx;
    bomb.y += bomb.vy;
    bomb.vy += gravity;
    if (bomb.y > 620) {
      store.state.bombs = store.state.bombs.filter((b) => b.id !== bomb.id);
    }
  }

  // 🎯 Level completion check
  if (score.value >= getLevelSettings().target && store.state.level <= 3) {
    levelComplete.value = true;
    clearInterval(spawnLoop);
  }
}

// ==============================
// Click Detection
// ==============================
function handleClick(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const HITBOX = 80;

  // Fruits
  for (const fruit of [...fruits.value]) {
    if (Math.abs(fruit.x - x) < HITBOX && Math.abs(fruit.y - y) < HITBOX) {
      store.commit("sliceFruit", fruit.id);
      return;
    }
  }

  // Bombs
  for (const bomb of [...bombs.value]) {
    if (Math.abs(bomb.x - x) < HITBOX && Math.abs(bomb.y - y) < HITBOX) {
      store.commit("sliceBomb", bomb.id);
      return;
    }
  }
}

// ==============================
// Spawn Logic
// ==============================
function spawnFruit() {
  const { gravity } = getLevelSettings();
  const id = ++store.state.fruitIdCounter;

  // Canvas width (same as .game-canvas)
  const canvasWidth = 800;
  const canvasHeight = 600;

  // Random horizontal start position
  const x = 80 + Math.random() * (canvasWidth - 160);
  const y = canvasHeight - 20; // start near bottom
  const vx = (Math.random() - 0.5) * 3; // slight sideways movement

  // 🎯 Calculate upward velocity so fruit reaches the top (y = 0)
  // vy = -√(2 * gravity * desiredHeight)
  const desiredHeight = canvasHeight - 100; // reach near top but not offscreen
  const vy = -Math.sqrt(2 * gravity * desiredHeight);

  // Add small random variation so not all fly identically
  const vyVariation = vy - Math.random() * 2;

  const icons = ["🍎", "🍊", "🍉", "🍌", "🍓", "🍒", "🍍"];
  const icon = icons[Math.floor(Math.random() * icons.length)];

  store.state.fruits.push({
    id,
    x,
    y,
    vx,
    vy: vyVariation, // slightly randomized upward speed
    icon,
  });
}


function spawnBomb() {
  if (!getLevelSettings().bombs) return; // ❌ No bombs in level 1
  const { gravity } = getLevelSettings();
  const id = ++store.state.bombIdCounter;

  const canvasWidth = 800;
  const canvasHeight = 600;

  const x = 80 + Math.random() * (canvasWidth - 160);
  const y = canvasHeight - 20; // same start as fruits
  const vx = (Math.random() - 0.5) * 3;

  // 🚀 Match fruit arc height: use same gravity formula as fruits
  const desiredHeight = canvasHeight - 100;
  const vy = -Math.sqrt(2 * gravity * desiredHeight) - Math.random() * 1.5;

  store.state.bombs.push({
    id,
    x,
    y,
    vx,
    vy,
  });
}


// ==============================
// Level Flow
// ==============================
function startLevel() {
  levelComplete.value = false;
  const { spawnRate } = getLevelSettings();

  physicsLoop = setInterval(() => {
    if (!store.state.gameOver) updatePositions();
  }, 50);

  spawnLoop = setInterval(() => {
    if (store.state.gameOver || levelComplete.value) return;
    if (Math.random() < 0.85) spawnFruit();
    else spawnBomb();
  }, spawnRate);
}

function nextLevel() {
  clearInterval(spawnLoop);
  clearInterval(physicsLoop);
  if (store.state.level < 3) {
    store.commit("nextLevel");
    startLevel();
  } else {
    levelComplete.value = false;
    store.commit("resetGame");
  }
}

onMounted(() => {
  startLevel();

  // 🖱️ Track cursor position for blade effect
  window.addEventListener("mousemove", (e) => {
    const rect = document.querySelector(".game-canvas").getBoundingClientRect();
    cursorX.value = e.clientX - rect.left - 20;
    cursorY.value = e.clientY - rect.top - 20;
  });
});

onUnmounted(() => {
  clearInterval(physicsLoop);
  clearInterval(spawnLoop);
});
</script>

<style scoped>
/* ====== Playful arcade vibe with pure CSS (no logic changes) ====== */

.game-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* Level pill with glow */
.level-banner {
  background: conic-gradient(from 120deg, #00cec9, #0984e3 40%, #00cec9 80%);
  color: #fff;
  padding: 10px 24px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: .3px;
  box-shadow: 0 10px 24px rgba(9,132,227,.25), inset 0 0 0 1px rgba(255,255,255,.18);
}

/* Canvas frame: neon bezel + soft gradient arena */
.game-canvas {
  position: relative;
  width: 800px;
  height: 600px;
  background:
    radial-gradient(900px 600px at 20% -10%, rgba(9,132,227,.14), transparent 60%),
    radial-gradient(800px 500px at 120% 110%, rgba(0,206,201,.13), transparent 60%),
    linear-gradient(180deg, #141821, #0f141c 55%, #0b1018);
  border: 4px solid transparent;
  border-radius: 20px;
  overflow: hidden;
  cursor: none;
  user-select: none;
  box-shadow:
    0 24px 50px rgba(0,0,0,.45),
    inset 0 0 0 1px rgba(255,255,255,.06);
}

/* Neon rim */
.game-canvas::before{
  content:'';
  position:absolute; inset:-3px;
  border-radius: 22px;
  background: linear-gradient(90deg,#74b9ff,#00cec9,#74b9ff);
  filter: blur(8px);
  opacity:.45;
  z-index:0;
  pointer-events:none;
}

/* Fruit/Bomb emoji styling (keeps your absolute positions) */
.fruit,
.bomb {
  position: absolute;
  font-size: 2.6rem;        /* slightly larger, easier to click */
  transform: translate(-50%, -50%) rotate(var(--rot, 0deg));
  transition: transform .05s linear;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,.35));
  z-index: 2;
}

/* Give fruits a lively wobble (subtle) */
.fruit {
  animation: wobble 1.2s ease-in-out infinite;
}
@keyframes wobble {
  0%,100% { --rot: -4deg; }
  50%     { --rot:  4deg; }
}

/* Bombs: danger glow */
.bomb{
  text-shadow: 0 0 10px rgba(255,77,109,.55), 0 0 20px rgba(255,77,109,.35);
  animation: pulse 1.3s ease-in-out infinite;
}
@keyframes pulse{
  0%,100% { filter: drop-shadow(0 6px 14px rgba(255,77,109,.3)); transform: translate(-50%,-50%) scale(1); }
  50%     { filter: drop-shadow(0 10px 22px rgba(255,77,109,.45)); transform: translate(-50%,-50%) scale(1.06); }
}

/* Level Complete overlay — glassy card */
.overlay {
  position: absolute; inset: 0;
  background:
    radial-gradient(700px 500px at 50% 30%, rgba(116,185,255,.18), transparent 60%),
    rgba(0,0,0,.55);
  color: white;
  display: grid;
  place-items: center;
  font-size: 1.8rem;
  animation: fadeIn .35s ease;
  z-index: 3;
}

.overlay > *{
  text-align:center;
  background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.03));
  border: 1px solid rgba(255,255,255,.12);
  padding: 18px 28px;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(0,0,0,.4);
}

.overlay h2 {
  margin: 0 0 10px;
  letter-spacing: .4px;
}

.overlay button {
  background: linear-gradient(180deg, #55efc4, #00cec9);
  border: none;
  padding: .8rem 1.5rem;
  font-size: 1.05rem;
  border-radius: 12px;
  margin-top: 12px;
  cursor: pointer;
  font-weight: 800;
  color: #0b0f14;
  box-shadow: 0 10px 26px rgba(0,206,201,.35), inset 0 0 0 1px rgba(0,0,0,.25);
  transition: transform .12s ease, filter .12s ease;
}
.overlay button:hover { transform: translateY(-1px); filter: saturate(1.08) }
.overlay button:active{ transform: translateY(1px) }

/* Custom cursor “energy blade” */
.cursor-blade {
  position: absolute;
  width: 28px;
  height: 28px;
  background:
    radial-gradient(ellipse at 50% 45%, rgba(255,255,255,.95), rgba(255,255,255,.55) 35%, rgba(129,236,236,.45) 60%, rgba(0,0,0,0) 72%);
  border: 2px solid rgba(0,206,201,.9);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  mix-blend-mode: screen;
  box-shadow:
    0 0 18px rgba(0,206,201,.9),
    0 0 40px rgba(0,206,201,.45);
  z-index: 4;
}

/* soft wake-up trail on movement (no JS needed) */
.cursor-blade::after{
  content:'';
  position:absolute;
  inset: -18px;
  border-radius:50%;
  background: radial-gradient(circle at 50% 50%, rgba(0,206,201,.25), transparent 70%);
  filter: blur(10px);
  opacity: .35;
}

@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
</style>
