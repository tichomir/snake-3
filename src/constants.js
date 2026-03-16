export const GRID_COLS = 20;
export const GRID_ROWS = 20;
export const CELL_SIZE = 20;   // pixels per cell — canvas = 400×400
export const TICK_MS   = 150;  // ms between game-logic ticks

export const DIRECTION = Object.freeze({
  UP:    { x:  0, y: -1 },
  DOWN:  { x:  0, y:  1 },
  LEFT:  { x: -1, y:  0 },
  RIGHT: { x:  1, y:  0 },
});

export const CELL_STATE = Object.freeze({
  EMPTY: 'empty',
  SNAKE: 'snake',
  FOOD:  'food',
});
