import { GRID_COLS, GRID_ROWS, CELL_SIZE } from './constants.js';

const W = GRID_COLS * CELL_SIZE;  // 400
const H = GRID_ROWS * CELL_SIZE;  // 400

const COLORS = {
  background:  '#1a1a2e',
  grid:        '#16213e',
  snake:       '#4ecca3',
  snakeHead:   '#f5a623',
  food:        '#e94560',
  text:        '#ffffff',
  overlay:     'rgba(0,0,0,0.75)',
  button:      '#4ecca3',
  buttonText:  '#0a0a1a',
  buttonFocus: '#f5a623',
};

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
  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth   = 0.5;
  for (let x = 0; x <= GRID_COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL_SIZE, 0);
    ctx.lineTo(x * CELL_SIZE, H);
    ctx.stroke();
  }
  for (let y = 0; y <= GRID_ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL_SIZE);
    ctx.lineTo(W, y * CELL_SIZE);
    ctx.stroke();
  }

  // Food
  if (state.food) {
    ctx.fillStyle = COLORS.food;
    ctx.fillRect(
      state.food.x * CELL_SIZE + 1,
      state.food.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
  }

  // Snake body (skip index 0 = head)
  ctx.fillStyle = COLORS.snake;
  for (let i = 1; i < state.snake.length; i++) {
    const seg = state.snake[i];
    ctx.fillRect(
      seg.x * CELL_SIZE + 1,
      seg.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
  }

  // Snake head
  if (state.snake.length > 0) {
    ctx.fillStyle = COLORS.snakeHead;
    const head = state.snake[0];
    ctx.fillRect(
      head.x * CELL_SIZE + 1,
      head.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
  }

  // Score HUD (#ffffff on #1a1a2e: contrast ~15.9:1 — WCAG AA ✓)
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
