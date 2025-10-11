import { createStore } from 'vuex'

export default createStore({
  state: {
    // === GAME STATE ===
    score: 0,
    lives: 3,
    level: 1,
    timer: 60, // seconds
    gameOver: false,
    gameStarted: false,
    gameWon: false,


    // === GAME OBJECTS ===
    fruits: [], // active fruits
    bombs: [],  // active bombs
    fruitIdCounter: 0,
    bombIdCounter: 0,

    // === SETTINGS ===
    levelTargets: { 1: 100, 2: 250, 3: 400 },
    levelTimers: { 1: 60, 2: 45, 3: 40 },
  },

  getters: {
    isGameWon: (state) =>
      state.score >= state.levelTargets[state.level] && !state.gameOver,
    isGameOver: (state) => state.gameOver,
    currentLevelTarget: (state) => state.levelTargets[state.level],
    remainingLives: (state) => state.lives,
  },

  mutations: {

    startGame(state) {
      state.gameStarted = true
      state.gameOver = false
      state.score = 0
      state.lives = 3
      state.level = 1
      state.timer = state.levelTimers[1]
      state.fruits = []
      state.bombs = []
      state.gameWon = false;
    },

    resetGame(state) {
      state.score = 0
      state.lives = 3
      state.level = 1
      state.timer = state.levelTimers[1]
      state.fruits = []
      state.bombs = []
      state.gameOver = false
      state.gameStarted = false
      state.gameWon = false;
    },

    addScore(state, points) {
      state.score += points
    },

    loseLife(state) {
      state.lives--
      if (state.lives <= 0) {
        state.gameOver = true
      }
    },


    nextLevel(state) {
  if (state.level < 3) {
    state.level++;
    if (state.level === 3) state.lives = 1; 
    state.score = 0;
    state.timer = state.levelTimers[state.level];
    state.fruits = [];
    state.bombs = [];
  } else {
    // 🎉 Player finished all levels
    state.gameWon = true;
    state.gameOver = false; // don't show game over
  }
},


  
    spawnFruit(state) {
      const id = ++state.fruitIdCounter
      const x = Math.random() * 2000 
      const y = 600 
      const velocityY = -(5 + Math.random() * 2)
      const fruit = { id, x, y, velocityY, type: 'fruit' }
      state.fruits.push(fruit)
    },

    sliceFruit(state, fruitId) {
      state.fruits = state.fruits.filter(f => f.id !== fruitId)
      state.score += 10
    },

    missFruit(state, fruitId) {
      state.fruits = state.fruits.filter(f => f.id !== fruitId)
      state.lives--
      if (state.lives <= 0) state.gameOver = true
    },

   
    spawnBomb(state) {
      const id = ++state.bombIdCounter
      const x = Math.random() * 2000
      const y = 600
      const velocityY = -(4 + Math.random() * 4)
      const bomb = { id, x, y, velocityY, type: 'bomb' }
      state.bombs.push(bomb)
    },

    sliceBomb(state, bombId) {
      state.bombs = state.bombs.filter(b => b.id !== bombId)
      state.gameOver = true
    },

    // === TIMER ===
    decrementTimer(state) {
      if (state.timer > 0) {
        state.timer--
      } else if (state.score < state.levelTargets[state.level]) {
        state.gameOver = true
      }
    }
  },

  actions: {
    // === GAME LOOP ACTIONS ===
    startLevel({ commit, state }) {
      commit('startGame')
      // example: spawn every 1.5 seconds
      const spawnInterval = setInterval(() => {
        if (state.gameOver) return clearInterval(spawnInterval)

        // 80% fruit, 20% bomb
        if (Math.random() < 0.8) commit('spawnFruit')
        else commit('spawnBomb')
      }, 1500)

      // timer countdown
      const timerInterval = setInterval(() => {
        if (state.gameOver) return clearInterval(timerInterval)
        commit('decrementTimer')
      }, 1000)
    },
  },
})
