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
  const id = ++store.state.bombIdCounter;
  const x = 80 + Math.random() * 640;
  const y = 580;
  const vx = (Math.random() - 0.5) * 3;
  const vy = -(7 + Math.random() * 2);
  store.state.bombs.push({ id, x, y, vx, vy });
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
.game-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.level-banner {
  background: linear-gradient(90deg, #00cec9, #0984e3);
  color: white;
  padding: 8px 20px;
  border-radius: 30px;
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.game-canvas {
  position: relative;
  width: 800px;
  height: 600px;
  background: grey; /* lighter */
  border: 4px solid #74b9ff;
  border-radius: 20px;
  overflow: hidden;
  cursor: none; /* hide system cursor */
  user-select: none;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.3);
}

.fruit,
.bomb {
  position: absolute;
  font-size: 2.5rem;
  transition: 0.05s;
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.4));
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.8rem;
  animation: fadeIn 0.5s ease;
}

.overlay button {
  background: #55efc4;
  border: none;
  padding: 0.8rem 1.5rem;
  font-size: 1.2rem;
  border-radius: 10px;
  margin-top: 15px;
  cursor: pointer;
  transition: 0.3s;
}

.overlay button:hover {
  background: #00cec9;
  color: white;
}

/* 🥷 Custom Cursor Blade */
.cursor-blade {
  position: absolute;
  width: 25px;
  height: 25px;
  background: radial-gradient(circle, white 0%, #81ecec 50%, transparent 70%);
  border: 2px solid #00cec9;
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  mix-blend-mode: overlay;
  box-shadow: 0 0 15px #00cec9;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
