<template>
  <div class="game-wrapper">
    <div class="level-banner">Level {{ level }}</div>

    <div class="game-canvas" @click="handleClick">
      <!-- Fruits -->
      <div
        v-for="fruit in fruits"
        :key="fruit.id"
        class="fruit"
        :data-type="fruit.type"
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
      <div v-if="levelComplete && !gameOver && !gameWon" class="overlay">
        <h2>🎯 Level {{ level }} Complete!</h2>
        <button @click="nextLevel">Next Level ▶</button>
      </div>

      <!-- Game Won Overlay -->
      <div v-if="gameWon" class="overlay">
        <h2>🏆 You Won the Game!</h2>
        <p>Your Final Score: {{ score }}</p>
        <button @click="restartGame">Play Again 🔁</button>
      </div>

      <!-- Slow motion text -->
      <div v-if="slowMotionActive" class="slowmo-text">⚡ Slow Motion Active!</div>

      <!-- Custom Cursor -->
      <div
        v-show="!gameOver && !gameWon"
        class="cursor-blade"
        :style="{ left: cursorX + 'px', top: cursorY + 'px' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useStore } from "vuex";
import confetti from "canvas-confetti";

const store = useStore();
const fruits = computed(() => store.state.fruits);
const bombs = computed(() => store.state.bombs);
const level = computed(() => store.state.level);
const score = computed(() => store.state.score);
const gameOver = computed(() => store.state.gameOver);
const gameWon = computed(() => store.state.gameWon);

let physicsLoop, spawnLoop;
const levelComplete = ref(false);
const slowMotionActive = ref(false);

const cursorX = ref(0);
const cursorY = ref(0);

const LEVEL_CONFIG = {
  1: { fruitSpeed: 8, gravity: 0.35, spawnRate: 1100, target: 100, bombs: false },
  2: { fruitSpeed: 10, gravity: 0.36, spawnRate: 950, target: 250, bombs: true },
  3: { fruitSpeed: 12, gravity: 0.38, spawnRate: 700, target: 300, bombs: true },
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

  // 🎯 Level complete
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

  for (const fruit of [...fruits.value]) {
    if (Math.abs(fruit.x - x) < HITBOX && Math.abs(fruit.y - y) < HITBOX) {
      // sliceFruit handles scoring (+10)
      store.commit("sliceFruit", fruit.id);

      if (store.state.level === 3) {
        if (fruit.type === "slow") activateSlowMotion();
        else if (fruit.type === "life") store.state.lives++;
      }
      return;
    }
  }

  for (const bomb of [...bombs.value]) {
    if (Math.abs(bomb.x - x) < HITBOX && Math.abs(bomb.y - y) < HITBOX) {
      store.commit("sliceBomb", bomb.id);
      return;
    }
  }
}

// ==============================
// Restart Logic
// ==============================
function restartGame() {
  clearInterval(spawnLoop);
  clearInterval(physicsLoop);
  store.commit("resetGame");
  store.state.gameWon = false;
  startLevel();
}

// ==============================
// Spawn Logic
// ==============================
function spawnFruit() {
  const { gravity } = getLevelSettings();
  const id = ++store.state.fruitIdCounter;
  const canvasWidth = 800;
  const canvasHeight = 600;

  const x = 80 + Math.random() * (canvasWidth - 160);
  const y = canvasHeight - 20;
  const vx = (Math.random() - 0.5) * 3;
  const desiredHeight = canvasHeight - 100;
  let vy = -Math.sqrt(2 * gravity * desiredHeight) - Math.random() * 2;

  let icon = "🍎";
  let type = "normal";

  if (store.state.level === 3) {
    const roll = Math.random();
    if (roll < 0.15) {
      icon = "💙";
      type = "slow";
    } else if (roll < 0.30) {
      icon = "💛";
      type = "life";
    } else {
      const icons = ["🍎", "🍊", "🍉", "🍌", "🍓", "🍒", "🍍"];
      icon = icons[Math.floor(Math.random() * icons.length)];
    }
    if (type !== "normal") vy *= 0.8;
  } else {
    const icons = ["🍎", "🍊", "🍉", "🍌", "🍓", "🍒", "🍍"];
    icon = icons[Math.floor(Math.random() * icons.length)];
  }

  store.state.fruits.push({ id, x, y, vx, vy, icon, type });
}

function spawnBomb() {
  if (!getLevelSettings().bombs) return;
  const { gravity } = getLevelSettings();
  const id = ++store.state.bombIdCounter;

  const canvasWidth = 800;
  const canvasHeight = 600;

  const x = 80 + Math.random() * (canvasWidth - 160);
  const y = canvasHeight - 20;
  const vx = (Math.random() - 0.5) * 3;
  const desiredHeight = canvasHeight - 100;
  const vy = -Math.sqrt(2 * gravity * desiredHeight) - Math.random() * 1.5;

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
    store.state.gameWon = true;

    const duration = 2500;
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 8,
        startVelocity: 30,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#00cec9", "#74b9ff", "#ffeaa7", "#fab1a0"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }
}

// ==============================
// Slow Motion Effect
// ==============================
function activateSlowMotion() {
  slowMotionActive.value = true;
  document.querySelector(".game-canvas").classList.add("slowmo");

  const { gravity, spawnRate } = getLevelSettings();
  const originalGravity = gravity;
  const originalSpawnRate = spawnRate;

  LEVEL_CONFIG[3].gravity = gravity * 0.4;
  clearInterval(spawnLoop);
  spawnLoop = setInterval(() => {
    if (!store.state.gameOver && !levelComplete.value) {
      if (Math.random() < 0.9) spawnFruit();
      else spawnBomb();
    }
  }, originalSpawnRate * 1.8);

  setTimeout(() => {
    LEVEL_CONFIG[3].gravity = originalGravity;
    document.querySelector(".game-canvas").classList.remove("slowmo");
    slowMotionActive.value = false;
    clearInterval(spawnLoop);
    spawnLoop = setInterval(() => {
      if (!store.state.gameOver && !levelComplete.value) {
        if (Math.random() < 0.9) spawnFruit();
        else spawnBomb();
      }
    }, originalSpawnRate);
  }, 5000);
}

onMounted(() => {
  startLevel();
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
  gap: 12px;
}
.level-banner {
  background: conic-gradient(from 120deg, #00cec9, #0984e3 40%, #00cec9 80%);
  color: #fff;
  padding: 10px 24px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 1.05rem;
  box-shadow: 0 10px 24px rgba(9,132,227,.25);
}
.game-canvas {
  position: relative;
  width: 800px;
  height: 600px;
  background: radial-gradient(900px 600px at 20% -10%, rgba(9,132,227,.14), transparent 60%),
              radial-gradient(800px 500px at 120% 110%, rgba(0,206,201,.13), transparent 60%),
              linear-gradient(180deg, #141821, #0f141c 55%, #0b1018);
  border-radius: 20px;
  overflow: hidden;
  cursor: none;
  user-select: none;
  box-shadow: 0 24px 50px rgba(0,0,0,.45);
}
.game-canvas.slowmo {
  box-shadow: 0 0 50px 10px rgba(0,206,201,.8);
  filter: brightness(1.2);
}
.slowmo-text {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: #74b9ff;
  font-weight: 700;
  text-shadow: 0 0 10px #00cec9;
  animation: pulseText 1s infinite;
  z-index: 10;
}
@keyframes pulseText { 50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); } }

.fruit, .bomb {
  position: absolute;
  font-size: 2.6rem;
  transform: translate(-50%, -50%) rotate(var(--rot, 0deg));
  transition: transform .05s linear;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,.35));
  z-index: 2;
}
.fruit[data-type="slow"] {
  filter: drop-shadow(0 0 10px #74b9ff) drop-shadow(0 0 20px #00cec9);
  animation: glowBlue 1.2s ease-in-out infinite;
}
@keyframes glowBlue { 50% { transform: translate(-50%,-50%) scale(1.1); } }
.fruit[data-type="life"] {
  filter: drop-shadow(0 0 10px #ffeaa7) drop-shadow(0 0 20px #fdcb6e);
  animation: glowGold 1.2s ease-in-out infinite;
}
@keyframes glowGold { 50% { transform: translate(-50%,-50%) scale(1.1); } }
.cursor-blade {
  position: absolute;
  width: 28px;
  height: 28px;
  background: radial-gradient(ellipse at 50% 45%, rgba(255,255,255,.95), rgba(129,236,236,.45) 60%);
  border-radius: 50%;
  mix-blend-mode: screen;
  box-shadow: 0 0 18px rgba(0,206,201,.9);
  pointer-events: none;
}
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,.55);
  display: grid;
  place-items: center;
  color: white;
  font-size: 1.8rem;
  z-index: 3;
}
.overlay h2 {
  color: #ffeaa7;
  text-shadow: 0 0 10px #fdcb6e, 0 0 20px #fab1a0;
}
</style>
