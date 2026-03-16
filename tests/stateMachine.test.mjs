/**
 * Integration and unit tests for GameStateMachine (src/stateMachine.js),
 * high score logic (src/game.js), and Play Again reset behaviour.
 * Run with: node tests/stateMachine.test.mjs
 */
import assert from 'assert';
import { GameStateMachine, GAME_STATE } from '../src/stateMachine.js';
import { state, tick, resetGame } from '../src/game.js';
import { DIRECTION } from '../src/constants.js';
import { getTickMs } from '../src/scoring.js';

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

// ─── Mock localStorage ────────────────────────────────────────────────────────

function makeMockStorage() {
  const store = Object.create(null);
  return {
    getItem(key)      { return key in store ? store[key] : null; },
    setItem(key, val) { store[key] = String(val); },
    removeItem(key)   { delete store[key]; },
    clear()           { Object.keys(store).forEach(k => delete store[k]); },
  };
}

function withMockStorage(mockStorage, fn) {
  const prev = globalThis.localStorage;
  globalThis.localStorage = mockStorage;
  try {
    fn();
  } finally {
    globalThis.localStorage = prev;
  }
}

// Reset the mutable game state to a known playing configuration.
function resetToPlaying(overrides = {}) {
  state.snake = [
    { x: 11, y: 10 },
    { x: 10, y: 10 },
    { x:  9, y: 10 },
  ];
  state.direction      = DIRECTION.RIGHT;
  state.nextDirection  = null;
  state.food           = { x: 15, y: 10 };
  state.pendingGrow    = false;
  state.score          = 0;
  state.foodEaten      = 0;
  state.highScore      = 0;
  state.newHighScoreSet = false;
  state.phase          = 'playing';
  Object.assign(state, overrides);
}

// ─── Valid state transitions ──────────────────────────────────────────────────

console.log('\nValid state transitions');

test('START → PLAYING via startGame()', () => {
  const sm = new GameStateMachine();
  assert.strictEqual(sm.current, GAME_STATE.START);
  sm.startGame();
  assert.strictEqual(sm.current, GAME_STATE.PLAYING);
});

test('PLAYING → PAUSED via pause()', () => {
  const sm = new GameStateMachine();
  sm.startGame();
  sm.pause();
  assert.strictEqual(sm.current, GAME_STATE.PAUSED);
});

test('PAUSED → PLAYING via resume()', () => {
  const sm = new GameStateMachine();
  sm.startGame();
  sm.pause();
  sm.resume();
  assert.strictEqual(sm.current, GAME_STATE.PLAYING);
});

test('PLAYING → GAME_OVER via gameOver()', () => {
  const sm = new GameStateMachine();
  sm.startGame();
  sm.gameOver();
  assert.strictEqual(sm.current, GAME_STATE.GAME_OVER);
});

test('GAME_OVER → START via restart()', () => {
  const sm = new GameStateMachine();
  sm.startGame();
  sm.gameOver();
  sm.restart();
  assert.strictEqual(sm.current, GAME_STATE.START);
});

// ─── Invalid / no-op transitions ─────────────────────────────────────────────

console.log('\nInvalid transitions — no-op, state must not be corrupted');

test('startGame() in PLAYING is a no-op (stays PLAYING)', () => {
  const sm = new GameStateMachine();
  sm.startGame();           // → PLAYING
  sm.startGame();           // invalid — already PLAYING
  assert.strictEqual(sm.current, GAME_STATE.PLAYING);
});

test('startGame() in GAME_OVER is a no-op (stays GAME_OVER)', () => {
  const sm = new GameStateMachine();
  sm.startGame();
  sm.gameOver();
  sm.startGame();           // invalid — not in START
  assert.strictEqual(sm.current, GAME_STATE.GAME_OVER);
});

test('pause() in PAUSED is a no-op — double-pause does not corrupt state', () => {
  const sm = new GameStateMachine();
  sm.startGame();
  sm.pause();
  sm.pause();               // second pause — invalid
  assert.strictEqual(sm.current, GAME_STATE.PAUSED);
});

test('resume() in PLAYING is a no-op (stays PLAYING)', () => {
  const sm = new GameStateMachine();
  sm.startGame();
  sm.resume();              // invalid — not PAUSED
  assert.strictEqual(sm.current, GAME_STATE.PLAYING);
});

test('gameOver() in START is a no-op (stays START)', () => {
  const sm = new GameStateMachine();
  sm.gameOver();            // invalid — not PLAYING
  assert.strictEqual(sm.current, GAME_STATE.START);
});

test('gameOver() in PAUSED is a no-op (stays PAUSED)', () => {
  const sm = new GameStateMachine();
  sm.startGame();
  sm.pause();
  sm.gameOver();            // invalid — not PLAYING
  assert.strictEqual(sm.current, GAME_STATE.PAUSED);
});

// ─── P-key toggle (togglePause) ───────────────────────────────────────────────

console.log('\nP-key toggle — only fires in PLAYING or PAUSED');

test('togglePause() in PLAYING transitions to PAUSED', () => {
  const sm = new GameStateMachine();
  sm.startGame();
  sm.togglePause();
  assert.strictEqual(sm.current, GAME_STATE.PAUSED);
});

test('togglePause() in PAUSED transitions back to PLAYING', () => {
  const sm = new GameStateMachine();
  sm.startGame();
  sm.togglePause();         // PLAYING → PAUSED
  sm.togglePause();         // PAUSED  → PLAYING
  assert.strictEqual(sm.current, GAME_STATE.PLAYING);
});

test('togglePause() in START is a no-op (stays START)', () => {
  const sm = new GameStateMachine();
  sm.togglePause();
  assert.strictEqual(sm.current, GAME_STATE.START);
});

test('togglePause() in GAME_OVER is a no-op (stays GAME_OVER)', () => {
  const sm = new GameStateMachine();
  sm.startGame();
  sm.gameOver();
  sm.togglePause();
  assert.strictEqual(sm.current, GAME_STATE.GAME_OVER);
});

// ─── High score — new record ──────────────────────────────────────────────────

console.log('\nHigh score — new record detection and localStorage persistence');

test('new high score: newHighScoreSet flag is true when score exceeds previous high', () => {
  const mock = makeMockStorage();
  withMockStorage(mock, () => {
    mock.setItem('snakeHighScore', '50');

    // score=50, eat one food (10 pts) → score becomes 60 > highScore=50
    resetToPlaying({
      score:           50,
      highScore:       50,
      foodEaten:       0,
      newHighScoreSet: false,
      food:            { x: 12, y: 10 }, // one step ahead of head (11,10) moving RIGHT
    });

    tick();

    assert.strictEqual(state.newHighScoreSet, true,
      'newHighScoreSet must be true after beating the high score');
  });
});

test('new high score: updated value is persisted to localStorage', () => {
  const mock = makeMockStorage();
  withMockStorage(mock, () => {
    mock.setItem('snakeHighScore', '50');

    resetToPlaying({
      score:           50,
      highScore:       50,
      foodEaten:       0,
      newHighScoreSet: false,
      food:            { x: 12, y: 10 },
    });

    tick();

    const stored = parseInt(mock.getItem('snakeHighScore'), 10);
    assert.ok(stored > 50,
      `localStorage must hold a value greater than 50 after new record, got ${stored}`);
    assert.strictEqual(stored, state.highScore,
      'stored value must equal state.highScore');
  });
});

test('no high score update when score is less than existing high score', () => {
  const mock = makeMockStorage();
  withMockStorage(mock, () => {
    mock.setItem('snakeHighScore', '500');

    // score=0 + 10pts = 10, which is far below highScore=500
    resetToPlaying({
      score:           0,
      highScore:       500,
      foodEaten:       0,
      newHighScoreSet: false,
      food:            { x: 12, y: 10 },
    });

    tick();

    assert.strictEqual(state.newHighScoreSet, false,
      'newHighScoreSet must remain false when score does not beat highScore');
    assert.strictEqual(parseInt(mock.getItem('snakeHighScore'), 10), 500,
      'localStorage value must be unchanged');
  });
});

test('no high score update when final score equals existing high score', () => {
  const mock = makeMockStorage();
  withMockStorage(mock, () => {
    mock.setItem('snakeHighScore', '10');

    // score=0 + 10pts = 10, which equals highScore=10 (not strictly greater)
    resetToPlaying({
      score:           0,
      highScore:       10,
      foodEaten:       0,
      newHighScoreSet: false,
      food:            { x: 12, y: 10 },
    });

    tick();

    assert.strictEqual(state.score, 10, 'sanity: score should be 10 after eating first food');
    assert.strictEqual(state.newHighScoreSet, false,
      'equal score must not set newHighScoreSet');
    assert.strictEqual(parseInt(mock.getItem('snakeHighScore'), 10), 10,
      'equal score must not overwrite localStorage');
  });
});

// ─── Play Again — full reset via resetGame() ──────────────────────────────────

console.log('\nPlay Again — resetGame() restores all initial values');

test('resetGame() resets score to 0', () => {
  resetToPlaying({ score: 250, foodEaten: 15 });
  resetGame();
  assert.strictEqual(state.score, 0);
});

test('resetGame() resets foodEaten to 0 (puts game back at speed tier 1 — 150ms)', () => {
  resetToPlaying({ foodEaten: 25 });
  resetGame();
  assert.strictEqual(state.foodEaten, 0);
  assert.strictEqual(getTickMs(state.foodEaten), 150,
    'foodEaten=0 must correspond to 150ms tick interval (tier 1)');
});

test('resetGame() restores snake to 3-segment initial position at grid centre', () => {
  resetToPlaying({
    snake: [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }, { x: 8, y: 5 }],
  });
  resetGame();
  assert.strictEqual(state.snake.length, 3, 'snake must have 3 segments after reset');
  assert.deepStrictEqual(state.snake[0], { x: 11, y: 10 }, 'head must be at (11,10)');
  assert.deepStrictEqual(state.snake[1], { x: 10, y: 10 });
  assert.deepStrictEqual(state.snake[2], { x:  9, y: 10 });
});

test('resetGame() resets direction to RIGHT', () => {
  resetToPlaying({ direction: DIRECTION.UP });
  resetGame();
  assert.deepStrictEqual(state.direction, DIRECTION.RIGHT);
});

test('resetGame() clears newHighScoreSet flag', () => {
  resetToPlaying({ newHighScoreSet: true });
  resetGame();
  assert.strictEqual(state.newHighScoreSet, false);
});

test('resetGame() sets phase back to playing', () => {
  resetToPlaying({ phase: 'over' });
  resetGame();
  assert.strictEqual(state.phase, 'playing');
});

test('resetGame() spawns food that does not overlap the reset snake', () => {
  resetGame();
  assert.ok(state.food !== null, 'food must be present after reset');
  const occupied = new Set(state.snake.map(s => `${s.x},${s.y}`));
  assert.strictEqual(occupied.has(`${state.food.x},${state.food.y}`), false,
    `food at (${state.food.x},${state.food.y}) must not overlap any snake cell`);
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
const total = passed + failed;
if (failed === 0) {
  console.log(`ALL TESTS PASSED (${passed}/${total})`);
} else {
  console.error(`${failed} FAILED, ${passed} passed (${total} total)`);
  process.exitCode = 1;
}
