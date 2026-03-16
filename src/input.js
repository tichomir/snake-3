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
