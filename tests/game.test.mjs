/**
 * Unit tests for Snake gameplay engine (src/game.js + src/constants.js)
 * Run with: node tests/game.test.mjs
 */
import { state, tick } from '../src/game.js';
import { DIRECTION, GRID_COLS, GRID_ROWS } from '../src/constants.js';
import assert from 'assert';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err.message}`);
    failed++;
  }
}

// Reset shared state to a known configuration before each test.
// state is a plain mutable object exported from game.js, so direct mutation works.
function resetState(overrides = {}) {
  state.snake = [
    { x: 11, y: 10 },
    { x: 10, y: 10 },
    { x:  9, y: 10 },
  ];
  state.direction     = DIRECTION.RIGHT;
  state.nextDirection = null;
  state.food          = { x: 15, y: 10 };
  state.pendingGrow   = false;
  state.score         = 0;
  state.phase         = 'playing';
  Object.assign(state, overrides);
}

// Mirrors the reverse-prevention guard from src/input.js.
// Returns true if the direction was accepted (i.e. not a reversal).
function applyInput(newDir) {
  if (newDir.x === -state.direction.x && newDir.y === -state.direction.y) return false;
  state.nextDirection = newDir;
  return true;
}

// ─── Initialisation ──────────────────────────────────────────────────────────

console.log('\nInitialisation');

test('snake initialises with length 3', () => {
  resetState();
  assert.strictEqual(state.snake.length, 3);
});

test('snake head initialises at (11,10) — grid centre for a length-3 snake facing RIGHT', () => {
  resetState();
  assert.deepStrictEqual(state.snake[0], { x: 11, y: 10 });
  assert.deepStrictEqual(state.snake[1], { x: 10, y: 10 });
  assert.deepStrictEqual(state.snake[2], { x:  9, y: 10 });
});

test('initial direction is RIGHT', () => {
  resetState();
  assert.deepStrictEqual(state.direction, DIRECTION.RIGHT);
});

test('initial phase is playing', () => {
  resetState();
  assert.strictEqual(state.phase, 'playing');
});

// ─── Movement ────────────────────────────────────────────────────────────────

console.log('\nMovement');

test('RIGHT: head advances x+1', () => {
  resetState();
  tick();
  assert.deepStrictEqual(state.snake[0], { x: 12, y: 10 });
});

test('RIGHT: tail is removed and length stays 3', () => {
  resetState();
  tick();
  assert.strictEqual(state.snake.length, 3);
  assert.strictEqual(state.snake.some(s => s.x === 9 && s.y === 10), false,
    'old tail (9,10) should be gone');
});

test('UP: head advances y-1', () => {
  resetState({ direction: DIRECTION.UP });
  tick();
  assert.deepStrictEqual(state.snake[0], { x: 11, y: 9 });
  assert.strictEqual(state.snake.length, 3);
});

test('DOWN: head advances y+1', () => {
  resetState({ direction: DIRECTION.DOWN });
  tick();
  assert.deepStrictEqual(state.snake[0], { x: 11, y: 11 });
  assert.strictEqual(state.snake.length, 3);
});

test('LEFT: head advances x-1', () => {
  resetState({
    snake: [{ x: 10, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 10 }],
    direction: DIRECTION.LEFT,
  });
  tick();
  assert.deepStrictEqual(state.snake[0], { x: 9, y: 10 });
  assert.strictEqual(state.snake.length, 3);
});

// ─── Eating food ─────────────────────────────────────────────────────────────

console.log('\nFood consumption and growth');

test('eating food: pendingGrow set to true on the eating tick', () => {
  resetState({ food: { x: 12, y: 10 } });
  tick();
  assert.deepStrictEqual(state.snake[0], { x: 12, y: 10 }, 'head should reach food');
  assert.strictEqual(state.pendingGrow, true);
});

test('eating food: score increments by 1', () => {
  resetState({ food: { x: 12, y: 10 } });
  tick();
  assert.strictEqual(state.score, 1);
});

test('eating food: snake length unchanged on the eating tick (tail still removed)', () => {
  resetState({ food: { x: 12, y: 10 } });
  tick();
  assert.strictEqual(state.snake.length, 3,
    'pendingGrow is queued but tail was already removed this tick');
});

test('eating food: snake grows by 1 on the tick after eating', () => {
  resetState({ food: { x: 12, y: 10 } });
  tick();                        // eating tick — pendingGrow=true, length=3
  state.food = { x: 15, y: 10 }; // ensure food is valid for next tick
  tick();                        // growth tick — tail retained
  assert.strictEqual(state.snake.length, 4);
  assert.strictEqual(state.pendingGrow, false, 'pendingGrow consumed');
});

test('food respawns after consumption and is not on the snake', () => {
  resetState({ food: { x: 12, y: 10 } });
  tick();
  assert.ok(state.food !== null, 'food must exist after eating');
  const occupied = new Set(state.snake.map(s => `${s.x},${s.y}`));
  assert.strictEqual(occupied.has(`${state.food.x},${state.food.y}`), false,
    'new food must not be on any snake cell');
});

// ─── Reverse-direction guard ──────────────────────────────────────────────────

console.log('\nReverse-direction guard');

test('RIGHT→LEFT reversal is rejected: nextDirection stays null', () => {
  resetState({ direction: DIRECTION.RIGHT });
  const accepted = applyInput(DIRECTION.LEFT);
  assert.strictEqual(accepted, false);
  assert.strictEqual(state.nextDirection, null);
});

test('RIGHT→LEFT reversal: direction unchanged after tick', () => {
  resetState({ direction: DIRECTION.RIGHT });
  applyInput(DIRECTION.LEFT);
  tick();
  assert.deepStrictEqual(state.direction, DIRECTION.RIGHT);
});

test('UP→DOWN reversal is rejected', () => {
  resetState({ direction: DIRECTION.UP });
  const accepted = applyInput(DIRECTION.DOWN);
  assert.strictEqual(accepted, false);
});

test('DOWN→UP reversal is rejected', () => {
  resetState({ direction: DIRECTION.DOWN });
  const accepted = applyInput(DIRECTION.UP);
  assert.strictEqual(accepted, false);
});

test('LEFT→RIGHT reversal is rejected', () => {
  resetState({
    snake: [{ x: 10, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 10 }],
    direction: DIRECTION.LEFT,
  });
  const accepted = applyInput(DIRECTION.RIGHT);
  assert.strictEqual(accepted, false);
});

test('non-reverse turn (RIGHT→UP) is accepted and applied on next tick', () => {
  resetState({ direction: DIRECTION.RIGHT });
  const accepted = applyInput(DIRECTION.UP);
  assert.strictEqual(accepted, true);
  assert.deepStrictEqual(state.nextDirection, DIRECTION.UP);
  tick();
  assert.deepStrictEqual(state.direction, DIRECTION.UP);
  assert.deepStrictEqual(state.snake[0], { x: 11, y: 9 });
});

// ─── Wall collision ───────────────────────────────────────────────────────────

console.log('\nWall collision');

test('wall collision: x < 0 (LEFT wall) triggers game-over', () => {
  resetState({
    snake: [{ x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 }],
    direction: DIRECTION.LEFT,
  });
  tick();
  assert.strictEqual(state.phase, 'over');
});

test('wall collision: x >= GRID_COLS (RIGHT wall) triggers game-over', () => {
  resetState({
    snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }],
    direction: DIRECTION.RIGHT,
  });
  tick();
  assert.strictEqual(state.phase, 'over');
});

test('wall collision: y < 0 (TOP wall) triggers game-over', () => {
  resetState({
    snake: [{ x: 10, y: 0 }, { x: 10, y: 1 }, { x: 10, y: 2 }],
    direction: DIRECTION.UP,
  });
  tick();
  assert.strictEqual(state.phase, 'over');
});

test('wall collision: y >= GRID_ROWS (BOTTOM wall) triggers game-over', () => {
  resetState({
    snake: [{ x: 10, y: 19 }, { x: 10, y: 18 }, { x: 10, y: 17 }],
    direction: DIRECTION.DOWN,
  });
  tick();
  assert.strictEqual(state.phase, 'over');
});

test('no wall collision one step from each wall: phase stays playing', () => {
  // Left edge — head at x=1 moving LEFT → lands on x=0, valid
  resetState({
    snake: [{ x: 1, y: 10 }, { x: 2, y: 10 }, { x: 3, y: 10 }],
    direction: DIRECTION.LEFT,
  });
  tick();
  assert.strictEqual(state.phase, 'playing');
  assert.strictEqual(state.snake[0].x, 0);
});

// ─── Self-collision ───────────────────────────────────────────────────────────

console.log('\nSelf-collision');

test('self-collision triggers game-over', () => {
  // Snake curled: head will step into its own body
  //   (10,10) → moving RIGHT → (11,10) which is snake[1]
  resetState({
    snake: [
      { x: 10, y: 10 },  // head
      { x: 11, y: 10 },  // body — next head position
      { x: 11, y: 11 },
      { x: 10, y: 11 },
    ],
    direction: DIRECTION.RIGHT,
  });
  tick();
  assert.strictEqual(state.phase, 'over');
});

test('self-collision: phase is over, snake not advanced', () => {
  resetState({
    snake: [
      { x: 10, y: 10 },
      { x: 11, y: 10 },
      { x: 11, y: 11 },
      { x: 10, y: 11 },
    ],
    direction: DIRECTION.RIGHT,
  });
  const headBefore = { ...state.snake[0] };
  tick();
  assert.deepStrictEqual(state.snake[0], headBefore, 'head should not move after game-over');
});

// ─── tick() is a no-op when not playing ──────────────────────────────────────

console.log('\ntick no-op');

test('tick does nothing when phase is over', () => {
  resetState({ phase: 'over' });
  const snapshot = JSON.stringify(state.snake);
  tick();
  assert.strictEqual(JSON.stringify(state.snake), snapshot);
  assert.strictEqual(state.phase, 'over');
});

// ─── Food placement ───────────────────────────────────────────────────────────

console.log('\nFood placement');

test('food is not on any snake cell after normal spawn', () => {
  resetState({ food: { x: 12, y: 10 } });
  tick(); // eat food → new food spawned
  const occupied = new Set(state.snake.map(s => `${s.x},${s.y}`));
  assert.strictEqual(occupied.has(`${state.food.x},${state.food.y}`), false);
});

test('food placement on near-full grid: only valid cell chosen', () => {
  // Fill all 400 cells except (0,0) and (0,1); leave (0,1) as the only free cell
  // after the eating tick pops the tail.
  //
  // Snake layout (398 cells): all cells EXCEPT (0,0) and (0,1).
  // Iteration order: for y 0..19, for x 0..19 — skipping (0,0) and (0,1).
  // So cells[0] = (1,0), cells[1] = (2,0), …, cells[397] = (19,19).
  // Head = cells[0] = (1,0), direction LEFT, food = (0,0).
  //
  // After tick:
  //   newHead = (0,0) → hits food → food eaten, pendingGrow=true
  //   tail (cells[397] = (19,19)) is popped (pendingGrow was false before this tick)
  //   spawnFood sees snake = [(0,0), (1,0), …, (18,19)] — 398 cells
  //   Free cells = {(0,1), (19,19)} — food must land on one of them
  const cells = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      if (!((x === 0 && y === 0) || (x === 0 && y === 1))) {
        cells.push({ x, y });
      }
    }
  }
  // cells[0] = (1,0) — will be head
  assert.deepStrictEqual(cells[0], { x: 1, y: 0 }, 'sanity: head cell should be (1,0)');
  assert.strictEqual(cells.length, 398, 'sanity: should have 398 cells');

  resetState({
    snake: cells,
    direction: DIRECTION.LEFT,
    food: { x: 0, y: 0 },
    pendingGrow: false,
  });

  tick();

  assert.strictEqual(state.phase, 'playing', 'game should still be playing');
  assert.ok(state.food !== null, 'food must exist');

  const occupied = new Set(state.snake.map(s => `${s.x},${s.y}`));
  assert.strictEqual(occupied.has(`${state.food.x},${state.food.y}`), false,
    `food at (${state.food.x},${state.food.y}) must not overlap any snake cell`);

  // The only valid positions are (0,1) and the popped tail (19,19)
  const validFoodPositions = ['0,1', '19,19'];
  assert.ok(
    validFoodPositions.includes(`${state.food.x},${state.food.y}`),
    `food must be at one of the two free cells, got (${state.food.x},${state.food.y})`
  );
});

test('food placement invariant holds over 50 consecutive food spawns', () => {
  resetState();
  for (let i = 0; i < 50; i++) {
    // Teleport food to the cell directly ahead of the head
    const head = state.snake[0];
    state.food = {
      x: head.x + state.direction.x,
      y: head.y + state.direction.y,
    };
    // Stop if food would be off-grid (shouldn't happen with a centred snake
    // but guard for safety)
    if (state.food.x < 0 || state.food.x >= GRID_COLS ||
        state.food.y < 0 || state.food.y >= GRID_ROWS) break;

    tick();
    if (state.phase !== 'playing') break;

    const occupied = new Set(state.snake.map(s => `${s.x},${s.y}`));
    assert.strictEqual(occupied.has(`${state.food.x},${state.food.y}`), false,
      `spawn ${i + 1}: food (${state.food.x},${state.food.y}) must not be on snake`);
  }
});

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
const total = passed + failed;
if (failed === 0) {
  console.log(`ALL TESTS PASSED (${passed}/${total})`);
} else {
  console.error(`${failed} FAILED, ${passed} passed (${total} total)`);
  process.exitCode = 1;
}
