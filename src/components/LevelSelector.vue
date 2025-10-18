<template>
  <div class="start-screen">
    <div class="bg-glow"></div>

    <div class="logo-container">
      <img src="/ninja.png" alt="Fruit Ninja Logo" class="game-logo" />
    </div>

    <div class="button-container">
      <div class="start-btn" @click="startGame">
        <span class="btn-text">START GAME</span>
       
      </div>

      <div class="inst-btn" @click="showInstructions">
        <span class="inst-text">INSTRUCTIONS</span>
      </div>
    </div>

    <!-- Instructions modal -->
    <div v-if="instructionsVisible" class="modal-overlay" @click="closeInstructions">
      <div class="modal-card" @click.stop>
        <h2>🎯 How to Play</h2>
        <ul>
          <li>🖱️ Click fruits before they fall to slice them!</li>
          <li>💣 Avoid clicking bombs — they end the game.</li>
          <li>💙 Special fruits grant slow motion or extra lives.</li>
          <li>🏆 Reach the target score to complete each level.</li>
        </ul>
        <button @click="closeInstructions">Got it!</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
const store = useStore();
const instructionsVisible = ref(false);

function startGame() {
  store.dispatch("startLevel");
}
function showInstructions() {
  instructionsVisible.value = true;
}
function closeInstructions() {
  instructionsVisible.value = false;
}
</script>

<style scoped>

.start-screen {
  position: relative;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #012b18, #024f2e, #046940);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.bg-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(0,255,170,0.15), rgba(0,100,40,0.25), rgba(0,255,180,0.1));
  background-size: 300% 300%;
  animation: bgFlow 8s ease-in-out infinite;
  z-index: 0;
}
@keyframes bgFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.logo-container {
  z-index: 1;
  text-align: center;
  margin-bottom: 3rem;
  animation: float 3s ease-in-out infinite;
}
.game-logo {
  width: 420px;
  height: auto;
  filter: drop-shadow(0 8px 18px rgba(0,0,0,0.6));
}
@keyframes float {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  z-index: 2;
}

.start-btn {
  position: relative;
  cursor: pointer;
  padding: 1rem 3rem;
  background: linear-gradient(180deg, #39ff90, #22c55e);
  border-radius: 50px;
  box-shadow: 0 10px 25px rgba(0,255,150,0.4),
              inset 0 0 0 2px rgba(0,0,0,0.2);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  overflow: hidden;
}
.start-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 15px 35px rgba(0,255,150,0.6);
}
.start-btn:active { transform: translateY(1px) scale(0.98); }
.btn-text {
  font-weight: 900;
  font-size: 1.5rem;
  color: #03160a;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 8px rgba(255,255,255,0.5);
}

.start-btn:hover .btn-spark { left: 110%; }

.inst-btn {
  cursor: pointer;
  border: 2px solid #00ff88;
  border-radius: 50px;
  padding: 0.8rem 2.4rem;
  background: rgba(0,255,120,0.05);
  color: #00ffb0;
  font-weight: 700;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  text-transform: uppercase;
}
.inst-btn:hover {
  background: rgba(0,255,120,0.15);
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0,255,100,0.4);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: grid;
  place-items: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}
.modal-card {
  background: linear-gradient(180deg, #04351c, #01220f);
  padding: 2rem 2.5rem;
  border-radius: 18px;
  box-shadow: 0 12px 35px rgba(0,0,0,0.4);
  color: #ccfcd8;
  width: 420px;
  text-align: center;
  border: 1px solid rgba(0,255,100,0.2);
}
.modal-card h2 { margin-bottom: 1rem; color: #76ffb4; }
.modal-card ul {
  text-align: left;
  margin: 0 0 1.5rem;
  padding-left: 1.2rem;
  line-height: 1.7;
}
.modal-card button {
  background: linear-gradient(180deg, #39ff90, #22c55e);
  border: none;
  padding: 0.6rem 1.4rem;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
  color: #05250f;
  transition: all 0.2s ease;
}
.modal-card button:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
