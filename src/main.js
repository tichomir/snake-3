import { state, tick, resetGame }         from './game.js';
import { render, BUTTONS }                from './renderer.js';
import { bindInput }                      from './input.js';
import { getTickMs }                      from './scoring.js';
import { GameStateMachine, GAME_STATE }   from './stateMachine.js';

const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

const sm = new GameStateMachine();

// Index of the currently focused button on the active screen.
// Each screen has exactly one button, so this is always 0.
let focusedButton = 0;

window.__frameCount = 0;
let lastTime    = 0;
let accumulated = 0;

// ---------------------------------------------------------------------------
// Button actions
// ---------------------------------------------------------------------------

function onStartGame() {
  if (sm.current !== GAME_STATE.START) return;
  resetGame();
  accumulated = 0;
  sm.startGame();
}

function onResume() {
  if (sm.current !== GAME_STATE.PAUSED) return;
  sm.resume();
}

function onPlayAgain() {
  if (sm.current !== GAME_STATE.GAME_OVER) return;
  sm.restart();
  focusedButton = 0;
}

function activateFocusedButton() {
  if      (sm.current === GAME_STATE.START)     onStartGame();
  else if (sm.current === GAME_STATE.PAUSED)    onResume();
  else if (sm.current === GAME_STATE.GAME_OVER) onPlayAgain();
}

// ---------------------------------------------------------------------------
// Input binding
// ---------------------------------------------------------------------------

bindInput({
  onPauseToggle: () => sm.togglePause(),
  onActivate:    () => activateFocusedButton(),
  // Single button per screen — Tab keeps focus on the only button
  onNextFocus:   () => { focusedButton = 0; },
});

// Canvas click → button hit-test
canvas.addEventListener('click', (e) => {
  const rect   = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const cx = (e.clientX - rect.left) * scaleX;
  const cy = (e.clientY - rect.top)  * scaleY;

  function hit(btn) {
    return cx >= btn.x && cx <= btn.x + btn.w &&
           cy >= btn.y && cy <= btn.y + btn.h;
  }

  if (sm.current === GAME_STATE.START     && hit(BUTTONS.startGame)) onStartGame();
  if (sm.current === GAME_STATE.PAUSED    && hit(BUTTONS.resume))    onResume();
  if (sm.current === GAME_STATE.GAME_OVER && hit(BUTTONS.playAgain)) onPlayAgain();
});

// Pointer cursor when hovering over active buttons
canvas.addEventListener('mousemove', (e) => {
  const rect   = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const cx = (e.clientX - rect.left) * scaleX;
  const cy = (e.clientY - rect.top)  * scaleY;

  function hit(btn) {
    return cx >= btn.x && cx <= btn.x + btn.w &&
           cy >= btn.y && cy <= btn.y + btn.h;
  }

  let hovering = false;
  if (sm.current === GAME_STATE.START     && hit(BUTTONS.startGame)) hovering = true;
  if (sm.current === GAME_STATE.PAUSED    && hit(BUTTONS.resume))    hovering = true;
  if (sm.current === GAME_STATE.GAME_OVER && hit(BUTTONS.playAgain)) hovering = true;

  canvas.style.cursor = hovering ? 'pointer' : 'default';
});

// Make canvas keyboard-reachable via Tab from surrounding HTML
canvas.setAttribute('tabindex', '0');
canvas.focus();

// ---------------------------------------------------------------------------
// Game loop
// ---------------------------------------------------------------------------

function update(delta) {
  if (sm.current !== GAME_STATE.PLAYING) return;

  // Cap delta to avoid a huge accumulated time after a tab-switch or slow load
  accumulated += Math.min(delta, 500);

  const tickMs = getTickMs(state.foodEaten);
  while (accumulated >= tickMs) {
    tick();
    accumulated -= tickMs;
  }

  // Detect game-end (wall/self-collision or board cleared)
  if (state.phase === 'over' || state.phase === 'won') {
    sm.gameOver();
    focusedButton = 0;
    accumulated   = 0;
  }
}

function loop(timestamp) {
  window.__frameCount++;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  update(delta);
  render(ctx, state, sm.current, focusedButton);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
