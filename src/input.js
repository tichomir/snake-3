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

const SWIPE_THRESHOLD = 30; // minimum px delta to register a swipe

/**
 * Bind touch swipe gesture input to a canvas element.
 * @param {HTMLCanvasElement} canvas
 */
export function bindTouchInput(canvas) {
  let touchStartX = 0;
  let touchStartY = 0;

  canvas.addEventListener('touchstart', (e) => {
    const t = e.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    e.preventDefault(); // prevent browser scroll/zoom during gameplay
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    const t  = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    // Ignore sub-threshold gestures (taps, micro-movements)
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;

    // Dominant axis wins
    const newDir = Math.abs(dx) >= Math.abs(dy)
      ? (dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT)
      : (dy > 0 ? DIRECTION.DOWN  : DIRECTION.UP);

    // Reverse-direction guard — same rule as keyboard input
    if (newDir.x === -state.direction.x && newDir.y === -state.direction.y) return;

    state.nextDirection = newDir;
  }, { passive: true });
}

/**
 * Bind keyboard input.
 * @param {object} handlers
 * @param {function} [handlers.onPauseToggle]  Called when P is pressed
 * @param {function} [handlers.onActivate]     Called when Enter or Space is pressed
 * @param {function} [handlers.onNextFocus]    Called when Tab is pressed
 */
export function bindInput(handlers = {}) {
  const { onPauseToggle, onActivate, onNextFocus } = handlers;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
      if (onPauseToggle) onPauseToggle();
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onActivate) onActivate();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      if (onNextFocus) onNextFocus();
      return;
    }

    // Direction keys — only act during gameplay
    const newDir = KEY_MAP[e.key];
    if (!newDir) return;

    // Reverse-prevention: reject if newDir is exactly opposite to current direction
    if (newDir.x === -state.direction.x && newDir.y === -state.direction.y) return;

    state.nextDirection = newDir;
  });
}
