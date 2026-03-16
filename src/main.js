import { state, tick, resetGame }         from './game.js';
import { render, BUTTONS }                from './renderer.js';
import { bindInput, bindTouchInput }       from './input.js';
import { getTickMs }                      from './scoring.js';
import { GameStateMachine, GAME_STATE }   from './stateMachine.js';
import { DIRECTION }                      from './constants.js';

const canvas      = document.getElementById('game-canvas');
const ctx         = canvas.getContext('2d');

// Accessibility: semantic SR-only buttons and live region (Bugs A-02, A-03)
const btnStart     = document.getElementById('btn-start');
const btnResume    = document.getElementById('btn-resume');
const btnPlayAgain = document.getElementById('btn-play-again');
const gameStatus   = document.getElementById('game-status');

const sm = new GameStateMachine();

// ---------------------------------------------------------------------------
// Responsive canvas scaling
// ---------------------------------------------------------------------------

// Logical game size in CSS pixels — matches GRID_COLS * CELL_SIZE
const LOGICAL_SIZE = 400;

// CSS display size of the canvas (updated by resizeCanvas)
let canvasScale = 1;

function resizeCanvas() {
  const dpr  = window.devicePixelRatio || 1;
  const vMin = Math.min(window.innerWidth, window.innerHeight);
  const size = Math.min(Math.max(vMin, 360), 1920);   // clamp 360–1920

  canvasScale = size / LOGICAL_SIZE;

  canvas.style.width  = size + 'px';
  canvas.style.height = size + 'px';
  canvas.width        = Math.round(size * dpr);
  canvas.height       = Math.round(size * dpr);

  // Re-render immediately so the frame isn't blank after resize
  renderFrame();
}

let resizePending = false;
window.addEventListener('resize', () => {
  if (resizePending) return;
  resizePending = true;
  requestAnimationFrame(() => {
    resizePending = false;
    resizeCanvas();
  });
});

// Index of the currently focused button on the active screen.
// Each screen has exactly one button, so this is always 0.
let focusedButton = 0;

window.__frameCount = 0;
let lastTime    = 0;
let accumulated = 0;

// ---------------------------------------------------------------------------
// FPS performance profiling instrumentation
// Maintains a rolling 120-frame window; logs median / p95 / dropped-frame
// statistics to the console every 60 frames.
// ---------------------------------------------------------------------------

const _PERF_WINDOW   = 120;    // frames retained in the rolling buffer
const _PERF_LOG_FREQ = 60;     // frames between console log outputs
const _FRAME_BUDGET  = 16.67;  // ms — one frame at 60 fps

const _frameDurations = new Float64Array(_PERF_WINDOW);
let _frameIdx         = 0;
let _frameFilled      = false;
let _droppedFrames    = 0;

function _logPerfStats() {
  const count = _frameFilled ? _PERF_WINDOW : _frameIdx;
  if (count < 2) return;

  const sorted = Float64Array.from(_frameDurations.subarray(0, count)).sort();
  const median = sorted[Math.floor(count / 2)];
  const p95    = sorted[Math.floor(count * 0.95)];

  console.log(
    `[Perf] frame=${window.__frameCount} | ` +
    `median=${median.toFixed(2)}ms (${(1000 / median).toFixed(1)} fps) | ` +
    `p95=${p95.toFixed(2)}ms | ` +
    `dropped(>${_FRAME_BUDGET}ms)=${_droppedFrames}`
  );
}

function _recordFrame(delta) {
  if (delta <= 0) return;
  _frameDurations[_frameIdx] = delta;
  if (delta > _FRAME_BUDGET) _droppedFrames++;
  _frameIdx++;
  if (_frameIdx >= _PERF_WINDOW) { _frameIdx = 0; _frameFilled = true; }
  if (window.__frameCount % _PERF_LOG_FREQ === 0) _logPerfStats();
}

// Expose profiling state on window for DevTools inspection
window.__perf = {
  get frameDurations() { return _frameDurations.slice(0, _frameFilled ? _PERF_WINDOW : _frameIdx); },
  get droppedFrames()  { return _droppedFrames; },
};

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
  resetGame();
  accumulated = 0;
  sm.restart();      // GAME_OVER → START
  sm.startGame();    // START → PLAYING
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
  const rect = canvas.getBoundingClientRect();
  // Map CSS pixels → logical game coordinates (0–400)
  const cx = (e.clientX - rect.left) / canvasScale;
  const cy = (e.clientY - rect.top)  / canvasScale;

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
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) / canvasScale;
  const cy = (e.clientY - rect.top)  / canvasScale;

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

// ---------------------------------------------------------------------------
// Touch swipe gesture handler
// ---------------------------------------------------------------------------

bindTouchInput(canvas);

// Make canvas keyboard-reachable via Tab from surrounding HTML
canvas.setAttribute('tabindex', '0');
canvas.focus();

// ---------------------------------------------------------------------------
// Game loop
// ---------------------------------------------------------------------------

// Apply the current scale transform then call render.
// Called from both the rAF loop and resizeCanvas().
function renderFrame() {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(canvasScale * dpr, 0, 0, canvasScale * dpr, 0, 0);
  render(ctx, state, sm.current, focusedButton);
}

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

  _recordFrame(delta);
  update(delta);
  renderFrame();

  requestAnimationFrame(loop);
}

// Size canvas before first frame so there's no flash of wrong size
resizeCanvas();
requestAnimationFrame(loop);
