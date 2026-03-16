import { state, tick }    from './game.js';
import { render as draw } from './renderer.js';
import { bindInput }      from './input.js';
import { getTickMs }      from './scoring.js';

const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

window.__frameCount = 0;
let lastTime    = 0;
let accumulated = 0;

bindInput();

function update(delta) {
  if (state.phase !== 'playing') return;
  accumulated += delta;
  const tickMs = getTickMs(state.foodEaten);
  while (accumulated >= tickMs) {
    tick();
    accumulated -= tickMs;
  }
}

function render() {
  draw(ctx, state);
}

function loop(timestamp) {
  window.__frameCount++;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  update(delta);
  render();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
