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
const emojiIcons = ref(["🍎","🍊","🍉","🍌","🍓","🍒","🍍"]);
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
    // 🛰️ Simple API fetch for emoji icons
fetch('/emojis.json')
  .then(r => r.json())
  .then(data => {
    if (Array.isArray(data.icons) && data.icons.length) {
      emojiIcons.value = data.icons;
    }
  })
  .catch(() => {
    // if fetch fails, fallback icons stay
  });

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

/* lacquered level pill */
.level-banner {
  background: linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.05));
  color: #23180f;
  padding: 8px 20px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 1.05rem;
  box-shadow: 0 14px 30px rgba(0,0,0,.18), inset 0 0 0 1px rgba(255,255,255,.35);
}

/* >>> Cutting board background <<< */
.game-canvas {
  position: relative;
  width: 800px;
  height: 600px;

  /* ✅ Correct public path */
  background-image: url('/desktop-wallpaper-fruit-ninja.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border: 4px solid #4b2e05;
  border-radius: 18px;
  overflow: hidden;
  cursor: none;
  user-select: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

/* --- VIGNETTE / BEVEL SHADOW --- */
.game-canvas::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(120% 80% at 50% 50%, transparent 58%, rgba(0, 0, 0, .45));
}
@keyframes pulseText { 50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); } }

/* Fruits and bombs */
.fruit, .bomb {
  position: absolute;
  font-size: 2.6rem;
  transform: translate(-50%, -50%) rotate(var(--rot, 0deg));
  transition: transform .05s linear;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, .35));
  z-index: 2;
}

.fruit {
  animation: wob .95s ease-in-out infinite;
  text-shadow: 0 0 12px rgba(255,255,255,.2), 0 0 8px rgba(255,120,60,.18);
}

@keyframes wob { 0%,100%{ --rot:-5deg } 50%{ --rot:5deg } }

.bomb {
  animation: pulse 1.1s ease-in-out infinite;
  text-shadow: 0 0 14px rgba(255,77,109,.55), 0 0 26px rgba(255,77,109,.35);
}

@keyframes pulse {
  0%,100% { transform: translate(-50%,-50%) scale(1) }
  50% { transform: translate(-50%,-50%) scale(1.06) }
}

/* Soft shadow */
.fruit::after, .bomb::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 48px;
  height: 14px;
  transform: translate(-50%, calc(50% + 22px));
  background: radial-gradient(closest-side, rgba(0,0,0,.45), transparent 70%);
  filter: blur(2px);
  opacity: .32;
  pointer-events: none;
}

/* Overlay */
.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 3;
  color: #1c140e;
  background:
    radial-gradient(700px 500px at 50% 30%, rgba(255,160,80,.15), transparent 60%),
    rgba(0,0,0,.55);
  backdrop-filter: blur(6px) saturate(1.05);
  font-size: 1.8rem;
  animation: fadeIn .35s ease;
}

.overlay > * {
  text-align: center;
  background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.04));
  border: 1px solid rgba(0,0,0,.16);
  padding: 18px 28px;
  border-radius: 16px;
  box-shadow: 0 22px 50px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.2);
}

.overlay button {
  background: linear-gradient(180deg, #39c46f, #2aa85d);
  color: #0b0f14;
  font-weight: 800;
  border: 0;
  padding: .85rem 1.6rem;
  border-radius: 12px;
  margin-top: 12px;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(42,168,93,.35), inset 0 0 0 1px rgba(0,0,0,.25);
  transition: transform .12s ease, filter .12s ease;
}

.overlay button:hover { transform: translateY(-1px); filter: saturate(1.06); }
.overlay button:active { transform: translateY(1px); }

.cursor-blade {
  position: absolute;
  z-index: 4;
  width: 28px;
  height: 28px;
  pointer-events: none;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,.7);
  background: radial-gradient(circle at 55% 45%, rgba(255,255,255,.95), rgba(255,255,255,.55) 35%, rgba(120,180,255,.45) 60%, transparent 72%);
  mix-blend-mode: screen;
  box-shadow: 0 0 22px rgba(220,240,255,.7), 0 0 44px rgba(180,210,255,.35);
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
