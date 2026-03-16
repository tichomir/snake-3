import { GRID_COLS, GRID_ROWS, CELL_SIZE } from './constants.js';

const W = GRID_COLS * CELL_SIZE;  // 400
const H = GRID_ROWS * CELL_SIZE;  // 400

// ---------------------------------------------------------------------------
// Named colour constants
// All non-text colours verified ≥3:1 against their background (WCAG AA for
// graphical elements); text colours verified ≥4.5:1 (WCAG AA for text).
// ---------------------------------------------------------------------------
const COLORS = {
  background:  '#1a1a2e',   // solid fill for non-game screens
  gridLight:   '#1e1e38',   // checkerboard light cell  (~3.4:1 vs snake body)
  gridDark:    '#161628',   // checkerboard dark cell   — subtle two-tone effect
  snake:       '#4ecca3',   // body segments (#4ecca3 on grid: ~10:1 — WCAG AA ✓)
  snakeHead:   '#f5a623',   // head amber   (#f5a623 on grid:  ~7.7:1 — WCAG AA ✓)
  snakeEye:    '#0a0a1a',   // eye dots on head
  food:        '#e94560',   // food accent  (#e94560 on grid:  ~4.7:1 — WCAG AA ✓)
  text:        '#ffffff',   // HUD / overlay text (#fff on dark: ~15.9:1 — WCAG AA ✓)
  overlay:     'rgba(0,0,0,0.75)',
  button:      '#4ecca3',
  buttonText:  '#0a0a1a',   // (#0a0a1a on teal/amber: >9:1 — WCAG AA ✓)
  buttonFocus: '#f5a623',
};

// ---------------------------------------------------------------------------
// Named size constants — no magic numbers in drawing code
// ---------------------------------------------------------------------------
const CELL_INSET  = 1;                      // gap between grid cell edge and drawn shape
const BODY_RADIUS = 3;                      // border-radius for body segments (px)
const HEAD_RADIUS = 4;                      // border-radius for head (px)
const EYE_RADIUS  = 1.5;                    // radius of each eye dot (px)
const FOOD_RADIUS = CELL_SIZE / 2 - 2;     // circle radius for food cell (8 px)

/**
 * Button hit-rects exported so main.js can perform click testing without
 * duplicating layout constants.
 */
export const BUTTONS = {
  startGame: { x: 120, y: 215, w: 160, h: 44 },
  resume:    { x: 130, y: 210, w: 140, h: 44 },
  playAgain: { x: 120, y: 260, w: 160, h: 44 },
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Fill a rounded rectangle path. Used instead of ctx.roundRect() for
 * compatibility with all target browser versions.
 */
function fillRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw the snake head with a rounded rect body and two directional eye dots.
 */
function drawSnakeHead(ctx, head, direction) {
  const px = head.x * CELL_SIZE + CELL_INSET;
  const py = head.y * CELL_SIZE + CELL_INSET;
  const sz = CELL_SIZE - CELL_INSET * 2;

  // Head fill
  ctx.fillStyle = COLORS.snakeHead;
  fillRoundRect(ctx, px, py, sz, sz, HEAD_RADIUS);

  // Eye positions depend on direction so they always face forward
  ctx.fillStyle = COLORS.snakeEye;
  const edgeFwd = sz * 0.72;  // distance from back edge toward the facing edge
  const eyeOff  = sz * 0.28;  // lateral offset from centre line

  let eye1, eye2;
  if (direction.x === 1) {          // RIGHT
    eye1 = { x: px + edgeFwd,      y: py + eyeOff      };
    eye2 = { x: px + edgeFwd,      y: py + sz - eyeOff };
  } else if (direction.x === -1) {  // LEFT
    eye1 = { x: px + sz - edgeFwd, y: py + eyeOff      };
    eye2 = { x: px + sz - edgeFwd, y: py + sz - eyeOff };
  } else if (direction.y === -1) {  // UP
    eye1 = { x: px + eyeOff,       y: py + sz - edgeFwd };
    eye2 = { x: px + sz - eyeOff,  y: py + sz - edgeFwd };
  } else {                          // DOWN
    eye1 = { x: px + eyeOff,       y: py + edgeFwd      };
    eye2 = { x: px + sz - eyeOff,  y: py + edgeFwd      };
  }

  ctx.beginPath();
  ctx.arc(eye1.x, eye1.y, EYE_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eye2.x, eye2.y, EYE_RADIUS, 0, Math.PI * 2);
  ctx.fill();
}

function drawButton(ctx, btn, label, focused) {
  // Button fill — teal normally, amber when focused (both contrast >9:1 on dark bg)
  ctx.fillStyle = focused ? COLORS.buttonFocus : COLORS.button;
  ctx.fillRect(btn.x, btn.y, btn.w, btn.h);

  // Button label (#0a0a1a on teal/amber: contrast >9:1 — WCAG AA ✓)
  ctx.fillStyle    = COLORS.buttonText;
  ctx.font         = 'bold 16px monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, btn.x + btn.w / 2, btn.y + btn.h / 2);
  ctx.textBaseline = 'alphabetic';

  // Visible focus ring for keyboard users
  if (focused) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 2;
    ctx.strokeRect(btn.x - 3, btn.y - 3, btn.w + 6, btn.h + 6);
  }
}

function renderGameBoard(ctx, state) {
  // Alternating two-shade checkerboard grid background
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? COLORS.gridLight : COLORS.gridDark;
      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  // Food — filled circle with accent colour
  if (state.food) {
    ctx.fillStyle = COLORS.food;
    ctx.beginPath();
    ctx.arc(
      state.food.x * CELL_SIZE + CELL_SIZE / 2,
      state.food.y * CELL_SIZE + CELL_SIZE / 2,
      FOOD_RADIUS,
      0, Math.PI * 2
    );
    ctx.fill();
  }

  // Snake body segments (index 1+) — rounded rectangles in snake-body colour
  ctx.fillStyle = COLORS.snake;
  for (let i = 1; i < state.snake.length; i++) {
    const seg = state.snake[i];
    fillRoundRect(
      ctx,
      seg.x * CELL_SIZE + CELL_INSET,
      seg.y * CELL_SIZE + CELL_INSET,
      CELL_SIZE - CELL_INSET * 2,
      CELL_SIZE - CELL_INSET * 2,
      BODY_RADIUS
    );
  }

  // Snake head (index 0) — distinct colour, rounded rect, directional eyes
  if (state.snake.length > 0) {
    drawSnakeHead(ctx, state.snake[0], state.direction);
  }

  // Score HUD (#ffffff on grid: contrast ~15.9:1 — WCAG AA ✓)
  ctx.fillStyle    = COLORS.text;
  ctx.font         = '14px monospace';
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`Score: ${state.score}`, 8, 16);
}

function renderStartScreen(ctx, highScore, focusedButton) {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, W, H);

  // Title (#4ecca3 on #1a1a2e: contrast ~9.5:1 — WCAG AA ✓)
  ctx.fillStyle    = COLORS.snake;
  ctx.font         = 'bold 56px monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('SNAKE', W / 2, 110);

  // Subtitle (#ffffff on #1a1a2e: WCAG AA ✓)
  ctx.fillStyle = COLORS.text;
  ctx.font      = '14px monospace';
  ctx.fillText('Arrow keys or WASD to move  •  P to pause', W / 2, 148);

  // High score
  ctx.font = '16px monospace';
  ctx.fillText(`Best: ${highScore}`, W / 2, 182);

  drawButton(ctx, BUTTONS.startGame, 'Start Game', focusedButton === 0);
}

function renderPausedOverlay(ctx, focusedButton) {
  // Semi-transparent overlay preserves the frozen game board below
  ctx.fillStyle = COLORS.overlay;
  ctx.fillRect(0, 0, W, H);

  // "PAUSED" (#ffffff on effective dark: WCAG AA ✓)
  ctx.fillStyle    = COLORS.text;
  ctx.font         = 'bold 36px monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('PAUSED', W / 2, 175);

  ctx.font = '14px monospace';
  ctx.fillText('Press P to resume', W / 2, 203);

  drawButton(ctx, BUTTONS.resume, 'Resume', focusedButton === 0);
}

function renderGameOverScreen(ctx, state, focusedButton) {
  ctx.fillStyle = COLORS.overlay;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle    = COLORS.text;
  ctx.font         = 'bold 32px monospace';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('GAME OVER', W / 2, 140);

  ctx.font = '18px monospace';
  ctx.fillText(`Score: ${state.score}`, W / 2, 178);
  ctx.fillText(`High Score: ${state.highScore}`, W / 2, 208);

  if (state.newHighScoreSet) {
    // Amber highlight for new record (#f5a623 on dark overlay: contrast >6:1 — WCAG AA ✓)
    ctx.fillStyle = COLORS.snakeHead;
    ctx.font      = 'bold 18px monospace';
    ctx.fillText('NEW HIGH SCORE!', W / 2, 238);
  }

  drawButton(ctx, BUTTONS.playAgain, 'Play Again', focusedButton === 0);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Main render entry point.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} state          Game state from game.js
 * @param {string} uiPhase        Current GAME_STATE value from stateMachine.js
 * @param {number} focusedButton  Index of the focused button (0 = first button)
 */
export function render(ctx, state, uiPhase, focusedButton = 0) {
  if (uiPhase === 'start') {
    renderStartScreen(ctx, state.highScore, focusedButton);
    return;
  }

  renderGameBoard(ctx, state);

  if (uiPhase === 'paused') {
    renderPausedOverlay(ctx, focusedButton);
  } else if (uiPhase === 'game_over') {
    renderGameOverScreen(ctx, state, focusedButton);
  }
}
