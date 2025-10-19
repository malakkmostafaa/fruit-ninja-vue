// src/game/audio.js
import { Sound } from "../utils/sound";
export const sfx = {
  win:  new Sound("/audio/win.mp3", 0.9),
  lose: new Sound("/audio/lose.mp3", 0.9),
  slice:      new Sound("/audio/slice.mp3", 0.65), 
};
