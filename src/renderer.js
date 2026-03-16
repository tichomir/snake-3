import { GRID_COLS, GRID_ROWS, CELL_SIZE } from './constants.js';

const W = GRID_COLS * CELL_SIZE;
const H = GRID_ROWS * CELL_SIZE;

const COLORS = {
  background: '#1a1a2e',
  grid:       '#16213e',
  snake:      '#4ecca3',
  snakeHead:  '#f5a623',
  food:       '#e94560',
  text:       '#ffffff',
};

export function render(ctx, state) {
  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 0.5;
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
  ctx.fillStyle = COLORS.food;
  ctx.fillRect(
    state.food.x * CELL_SIZE + 1,
    state.food.y * CELL_SIZE + 1,
    CELL_SIZE - 2,
    CELL_SIZE - 2
  );

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

  // Score HUD
  ctx.fillStyle = COLORS.text;
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${state.score}`, 8, 16);

  // Game-over overlay
  if (state.phase === 'over') {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H / 2 - 12);
    ctx.font = '14px monospace';
    ctx.fillText(`Score: ${state.score}`, W / 2, H / 2 + 16);
    ctx.textAlign = 'left';
  }

  // Win overlay
  if (state.phase === 'won') {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = COLORS.snake;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!', W / 2, H / 2);
    ctx.textAlign = 'left';
  }
}
