import { DIRECTION, GRID_COLS, GRID_ROWS } from './constants.js';
import { getPointsForFood, loadHighScore, saveHighScore } from './scoring.js';

function spawnFood(snake) {
  const occupied = new Set(snake.map(s => `${s.x},${s.y}`));
  const candidates = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      if (!occupied.has(`${x},${y}`)) candidates.push({ x, y });
    }
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export const state = {
  // Head at index 0; initial position: length 3 facing RIGHT at grid centre
  snake: [
    { x: 11, y: 10 },  // head
    { x: 10, y: 10 },  // body
    { x:  9, y: 10 },  // tail
  ],
  direction:     DIRECTION.RIGHT,
  nextDirection: null,
  food:          null,
  pendingGrow:   false,
  score:         0,
  foodEaten:     0,
  highScore:     loadHighScore(),
  phase:         'playing',  // 'playing' | 'over' | 'won'
};

state.food = spawnFood(state.snake);

export function tick() {
  if (state.phase !== 'playing') return;

  // 1. Apply buffered direction
  if (state.nextDirection !== null) {
    state.direction = state.nextDirection;
    state.nextDirection = null;
  }

  // 2. Compute new head position
  const newHead = {
    x: state.snake[0].x + state.direction.x,
    y: state.snake[0].y + state.direction.y,
  };

  // 3. Wall collision
  if (newHead.x < 0 || newHead.x >= GRID_COLS ||
      newHead.y < 0 || newHead.y >= GRID_ROWS) {
    state.phase = 'over';
    return;
  }

  // 4. Self-collision
  if (state.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
    state.phase = 'over';
    return;
  }

  // 5. Prepend new head
  state.snake.unshift(newHead);

  // 6. Grow or shrink tail
  if (state.pendingGrow) {
    state.pendingGrow = false;
  } else {
    state.snake.pop();
  }

  // 7. Food check
  if (newHead.x === state.food.x && newHead.y === state.food.y) {
    state.pendingGrow = true;
    state.score += getPointsForFood(state.foodEaten);
    state.foodEaten += 1;
    if (state.score > state.highScore) {
      state.highScore = state.score;
      saveHighScore(state.highScore);
    }
    const newFood = spawnFood(state.snake);
    if (newFood === null) {
      state.phase = 'won';
    } else {
      state.food = newFood;
    }
  }
}
