// src/utils/sound.js
let unlocked = false;
function unlock() {
  if (!unlocked) {
    const a = new Audio();
    a.play?.().catch(() => {}); // prime autoplay policies
    unlocked = true;
  }
}
export class Sound {
  constructor(src, volume = 1.0) { this.src = src; this.volume = volume; }
  play() {
    unlock();
    const el = new Audio(this.src);
    el.preload = "auto";
    el.volume = this.volume;
    el.play().catch(() => {});
  }
}
