import { state } from './game.js';
import { DIRECTION } from './constants.js';

const KEY_MAP = {
  ArrowUp:    DIRECTION.UP,
  ArrowDown:  DIRECTION.DOWN,
  ArrowLeft:  DIRECTION.LEFT,
  ArrowRight: DIRECTION.RIGHT,
  w: DIRECTION.UP,
  W: DIRECTION.UP,
  s: DIRECTION.DOWN,
  S: DIRECTION.DOWN,
  a: DIRECTION.LEFT,
  A: DIRECTION.LEFT,
  d: DIRECTION.RIGHT,
  D: DIRECTION.RIGHT,
};

export function bindInput() {
  document.addEventListener('keydown', (e) => {
    const newDir = KEY_MAP[e.key];
    if (!newDir) return;

    // Reverse-prevention: reject if newDir is exactly opposite to current direction
    if (newDir.x === -state.direction.x && newDir.y === -state.direction.y) return;

    state.nextDirection = newDir;
  });
}
