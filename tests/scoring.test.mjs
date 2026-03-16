/**
 * Unit tests for scoring logic and speed-tier progression (src/scoring.js)
 * Run with: node tests/scoring.test.mjs
 */
import {
  getScoreMultiplier,
  getPointsForFood,
  getTickMs,
  loadHighScore,
  saveHighScore,
} from '../src/scoring.js';
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

// ─── Mock localStorage ────────────────────────────────────────────────────────

function makeMockStorage() {
  const store = Object.create(null);
  return {
    getItem(key)       { return key in store ? store[key] : null; },
    setItem(key, val)  { store[key] = String(val); },
    removeItem(key)    { delete store[key]; },
    clear()            { Object.keys(store).forEach(k => delete store[k]); },
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

// ─── Score multiplier tiers ───────────────────────────────────────────────────

console.log('\nScore multiplier — tier boundaries');

test('multiplier is x1.0 at foodEaten=0 (start of tier 1)', () => {
  assert.strictEqual(getScoreMultiplier(0), 1.0);
});

test('multiplier is x1.0 at foodEaten=9 (last food of tier 1)', () => {
  assert.strictEqual(getScoreMultiplier(9), 1.0);
});

test('multiplier is x1.5 at foodEaten=10 (first food of tier 2)', () => {
  assert.strictEqual(getScoreMultiplier(10), 1.5);
});

test('multiplier is x1.5 at foodEaten=19 (last food of tier 2)', () => {
  assert.strictEqual(getScoreMultiplier(19), 1.5);
});

test('multiplier is x2.0 at foodEaten=20 (first food of tier 3)', () => {
  assert.strictEqual(getScoreMultiplier(20), 2.0);
});

test('multiplier is x2.0 at foodEaten=50 (well into tier 3)', () => {
  assert.strictEqual(getScoreMultiplier(50), 2.0);
});

// ─── Points per food item ─────────────────────────────────────────────────────

console.log('\nPoints per food — correct values per tier');

test('tier 1: 10 pts at foodEaten=0', () => {
  assert.strictEqual(getPointsForFood(0), 10);
});

test('tier 1: 10 pts at foodEaten=5 (mid tier 1)', () => {
  assert.strictEqual(getPointsForFood(5), 10);
});

test('tier 1: 10 pts at foodEaten=9 (last of tier 1)', () => {
  assert.strictEqual(getPointsForFood(9), 10);
});

test('tier 2: 15 pts at foodEaten=10 (first of tier 2)', () => {
  assert.strictEqual(getPointsForFood(10), 15);
});

test('tier 2: 15 pts at foodEaten=15 (mid tier 2)', () => {
  assert.strictEqual(getPointsForFood(15), 15);
});

test('tier 2: 15 pts at foodEaten=19 (last of tier 2)', () => {
  assert.strictEqual(getPointsForFood(19), 15);
});

test('tier 3: 20 pts at foodEaten=20 (first of tier 3)', () => {
  assert.strictEqual(getPointsForFood(20), 20);
});

test('tier 3: 20 pts at foodEaten=30 (well into tier 3)', () => {
  assert.strictEqual(getPointsForFood(30), 20);
});

// ─── Speed tier transitions ───────────────────────────────────────────────────

console.log('\nSpeed tier transitions — tick interval (ms)');

// Base: 150ms at food=0; each group of 5 reduces by 15ms; floor at 60ms.

test('speed is 150ms at foodEaten=0 (level 0, before first transition)', () => {
  assert.strictEqual(getTickMs(0), 150);
});

test('speed is 150ms at foodEaten=4 (still level 0, one before threshold)', () => {
  assert.strictEqual(getTickMs(4), 150);
});

test('speed is 135ms at foodEaten=5 (level 1, first transition)', () => {
  assert.strictEqual(getTickMs(5), 135);
});

test('speed is 135ms at foodEaten=9 (still level 1)', () => {
  assert.strictEqual(getTickMs(9), 135);
});

test('speed is 120ms at foodEaten=10 (level 2, second transition)', () => {
  assert.strictEqual(getTickMs(10), 120);
});

test('speed is 120ms at foodEaten=14 (still level 2)', () => {
  assert.strictEqual(getTickMs(14), 120);
});

test('speed is 105ms at foodEaten=15 (level 3, third transition)', () => {
  assert.strictEqual(getTickMs(15), 105);
});

test('speed is 105ms at foodEaten=19 (still level 3)', () => {
  assert.strictEqual(getTickMs(19), 105);
});

test('speed is 90ms at foodEaten=20 (level 4, fourth transition)', () => {
  assert.strictEqual(getTickMs(20), 90);
});

test('speed is 90ms at foodEaten=24 (still level 4)', () => {
  assert.strictEqual(getTickMs(24), 90);
});

test('speed is 60ms at foodEaten=60 (floored at minimum)', () => {
  assert.strictEqual(getTickMs(60), 60);
});

test('speed does not drop below 60ms floor at very high foodEaten', () => {
  assert.strictEqual(getTickMs(1000), 60);
});

// ─── No double-transition when foodEaten jumps by more than 1 ────────────────

console.log('\nNo double-transition on skipped food counts');

test('jumping from foodEaten=4 to 6 (skipping threshold=5) yields single level-1 speed', () => {
  // foodEaten=4 → level 0 (150ms); foodEaten=6 → level 1 (135ms)
  // Only ONE speed level is active — no phantom intermediate state.
  assert.strictEqual(getTickMs(4), 150);
  assert.strictEqual(getTickMs(6), 135);
  // No intermediate "double" state exists: calling getTickMs(6) directly
  // returns level 1 only, not level 0 again, confirming a single transition.
});

test('jumping from foodEaten=8 to 12 (crossing threshold=10) yields level-2 speed directly', () => {
  assert.strictEqual(getTickMs(8),  135); // level 1
  assert.strictEqual(getTickMs(12), 120); // level 2 — one tier up, not two
});

test('jumping over two thresholds (foodEaten=3 to 13) resolves to level 2, not level 0', () => {
  // Crosses thresholds at 5 and 10; result must be level 2 = 120ms.
  assert.strictEqual(getTickMs(3),  150); // level 0 baseline
  assert.strictEqual(getTickMs(13), 120); // level 2 — exactly two tiers up
  // Confirm it's not level 1 (135) or level 0 (150).
  assert.notStrictEqual(getTickMs(13), 150);
  assert.notStrictEqual(getTickMs(13), 135);
});

// ─── localStorage — high score write guard ────────────────────────────────────

console.log('\nlocalStorage — high score write guard');

test('saveHighScore writes a value that loadHighScore reads back', () => {
  const mock = makeMockStorage();
  withMockStorage(mock, () => {
    saveHighScore(100);
    assert.strictEqual(loadHighScore(), 100);
  });
});

test('loadHighScore returns 0 when localStorage has no stored value', () => {
  const mock = makeMockStorage();
  withMockStorage(mock, () => {
    assert.strictEqual(loadHighScore(), 0);
  });
});

test('saveHighScore overwrites a lower stored value with a higher one', () => {
  const mock = makeMockStorage();
  withMockStorage(mock, () => {
    saveHighScore(50);
    saveHighScore(200);
    assert.strictEqual(loadHighScore(), 200);
  });
});

test('saveHighScore can overwrite a higher stored value with a lower one (raw write, no guard)', () => {
  // saveHighScore is a raw write; the guard lives in game.js (score > highScore).
  // The scoring module itself does not filter — verify it writes whatever it receives.
  const mock = makeMockStorage();
  withMockStorage(mock, () => {
    saveHighScore(500);
    saveHighScore(10);
    assert.strictEqual(loadHighScore(), 10);
  });
});

// ─── High score update logic (as implemented in game.js) ─────────────────────

console.log('\nHigh score update — only when score exceeds stored value');

test('high score NOT updated when current score is lower than stored', () => {
  const mock = makeMockStorage();
  withMockStorage(mock, () => {
    saveHighScore(300);
    // Simulate the guard from game.js: only save if score > stored highScore
    const currentScore = 150;
    const storedBefore = loadHighScore();
    if (currentScore > storedBefore) saveHighScore(currentScore);
    assert.strictEqual(loadHighScore(), 300, 'stored value must be unchanged');
  });
});

test('high score updated when current score exceeds stored value', () => {
  const mock = makeMockStorage();
  withMockStorage(mock, () => {
    saveHighScore(100);
    const currentScore = 250;
    const storedBefore = loadHighScore();
    if (currentScore > storedBefore) saveHighScore(currentScore);
    assert.strictEqual(loadHighScore(), 250, 'stored value must be updated');
  });
});

test('high score NOT updated when current score equals stored value', () => {
  const mock = makeMockStorage();
  withMockStorage(mock, () => {
    saveHighScore(200);
    const currentScore = 200;
    const storedBefore = loadHighScore();
    if (currentScore > storedBefore) saveHighScore(currentScore);
    assert.strictEqual(loadHighScore(), 200, 'equal score must not overwrite');
  });
});

// ─── High score persistence across simulated page reloads ────────────────────

console.log('\nHigh score persistence across simulated page reloads');

test('high score survives a simulated reload (re-reading from same mock storage)', () => {
  const mock = makeMockStorage();
  // "Session 1" — play game, set high score
  withMockStorage(mock, () => {
    saveHighScore(750);
  });
  // "Session 2" — new page load, read back
  withMockStorage(mock, () => {
    assert.strictEqual(loadHighScore(), 750);
  });
});

test('high score of 0 is returned after clearing storage (fresh install)', () => {
  const mock = makeMockStorage();
  withMockStorage(mock, () => {
    saveHighScore(500);
    mock.clear();
    assert.strictEqual(loadHighScore(), 0);
  });
});

test('high score persists across multiple reload cycles without decay', () => {
  const mock = makeMockStorage();
  const scores = [100, 350, 200, 500, 480];
  let expectedHighScore = 0;

  for (const score of scores) {
    withMockStorage(mock, () => {
      const stored = loadHighScore();
      if (score > stored) {
        saveHighScore(score);
        expectedHighScore = score;
      }
    });
  }

  withMockStorage(mock, () => {
    assert.strictEqual(loadHighScore(), expectedHighScore);
    assert.strictEqual(loadHighScore(), 500, 'maximum score across all sessions');
  });
});

test('loadHighScore returns 0 (not NaN or null) for a stored empty string', () => {
  const mock = makeMockStorage();
  withMockStorage(mock, () => {
    mock.setItem('snakeHighScore', '');
    // parseInt('', 10) === NaN; loadHighScore uses `stored ? ...` which treats '' as falsy
    assert.strictEqual(loadHighScore(), 0);
  });
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
