# ADR-003: Scoring System and Speed-Tier Architecture

**Date:** 2026-03-16
**Status:** Accepted
**Author:** Software Architect

---

## Context

Sprint 4 introduces a scoring system and progressive speed increases. The system
must be self-consistent — speed tier drives both the tick interval and the score
multiplier, so the two concerns are specified together in this ADR.

---

## Scoring Formula

### Base Rule

```
points = SCORE_PER_FOOD × tier.multiplier
```

`SCORE_PER_FOOD = 10`.

Each time the snake eats food, exactly one points calculation is performed. The
multiplier is read from the **currently active tier** at the moment of eating.

### Speed / Multiplier Tiers

Three tiers are defined. Tier is determined solely by `state.foodEaten` (total food
items consumed since the game started, tracked separately from accumulated points):

| Tier index | `foodEaten` range | `tickMs` | Multiplier | Points per food |
|:----------:|:-----------------:|:--------:|:----------:|:---------------:|
| 0 (Normal) | 0 – 4             | 150 ms   | ×1.0       | 10              |
| 1 (Fast)   | 5 – 9             | 120 ms   | ×1.5       | 15              |
| 2 (Turbo)  | 10+               |  90 ms   | ×2.0       | 20              |

Tier transitions occur **at the tick when the 5th / 10th food item is eaten** —
i.e., immediately, not on the following tick. The speed change takes effect on the
next call to `update()` in `src/main.js` because the accumulator reads
`state.currentTickMs` rather than the static `TICK_MS` constant.

### Example Progression

```
food #1  → foodEaten=1,  tier 0, score += 10  → score  10
food #4  → foodEaten=4,  tier 0, score += 10  → score  40
food #5  → foodEaten=5,  tier 1, score += 15  → score  55
food #9  → foodEaten=9,  tier 1, score += 15  → score 115
food #10 → foodEaten=10, tier 2, score += 20  → score 135
```

---

## High Score Persistence

- Key in `localStorage`: `"snakeHighScore"`.
- On game start (state initialisation): read `localStorage.getItem('snakeHighScore')`
  and store parsed integer in `state.highScore` (default `0` if absent or NaN).
- On every food-eat that raises `state.score` above `state.highScore`: update
  `state.highScore` and write `localStorage.setItem('snakeHighScore', state.highScore)`.
- Writes are synchronous and happen inside `tick()`, consistent with how all other
  state mutations are handled. No debounce is required at this scale.

---

## State Shape Changes

The following fields are **added** to the `state` object in `src/game.js`:

```js
{
  // --- existing fields ---
  snake, direction, nextDirection, food, pendingGrow, phase,
  score,       // now accumulates actual points (not raw food count)

  // --- new fields ---
  foodEaten:      0,    // count of food items eaten; drives tier lookup
  speedTier:      0,    // index into SPEED_TIERS (0 | 1 | 2)
  currentTickMs:  150,  // mirror of SPEED_TIERS[speedTier].tickMs; read by main.js
  highScore:      0,    // persisted via localStorage
}
```

`score` changes meaning: it was previously the raw food count; it now holds
accumulated points. `foodEaten` takes over the counting role.

---

## Constants (src/constants.js additions)

```js
export const SCORE_PER_FOOD = 10;

export const SPEED_TIERS = Object.freeze([
  { foodThreshold:  0, tickMs: 150, multiplier: 1.0 },
  { foodThreshold:  5, tickMs: 120, multiplier: 1.5 },
  { foodThreshold: 10, tickMs:  90, multiplier: 2.0 },
]);
```

`TICK_MS` is **retained** as the initial/default tick interval (equal to
`SPEED_TIERS[0].tickMs`) so existing tests continue to compile without change.
`src/main.js` must be updated to use `state.currentTickMs` in the accumulator loop
(see Integration section below).

---

## Hook Points in src/game.js

Three locations inside `tick()` require changes:

### Hook A — After food is confirmed eaten (step 7)

Current code (step 7 in `tick()`):
```js
if (newHead.x === state.food.x && newHead.y === state.food.y) {
  state.pendingGrow = true;
  state.score += 1;          // ← REPLACE with scoring + tier logic
  const newFood = spawnFood(state.snake);
  ...
}
```

Replace `state.score += 1` with:

```js
state.foodEaten += 1;

// Recalculate tier
const newTier = SPEED_TIERS.findLastIndex(t => state.foodEaten >= t.foodThreshold);
if (newTier !== state.speedTier) {
  state.speedTier    = newTier;
  state.currentTickMs = SPEED_TIERS[newTier].tickMs;
}

// Accumulate points using the (possibly just-updated) tier multiplier
state.score += Math.round(SCORE_PER_FOOD * SPEED_TIERS[state.speedTier].multiplier);

// High score persistence
if (state.score > state.highScore) {
  state.highScore = state.score;
  localStorage.setItem('snakeHighScore', state.highScore);
}
```

### Hook B — State initialisation

Add `foodEaten`, `speedTier`, `currentTickMs`, and `highScore` to the initial
`state` object literal, reading the persisted high score:

```js
const savedHigh = parseInt(localStorage.getItem('snakeHighScore'), 10);

export const state = {
  // ... existing fields ...
  score:          0,
  foodEaten:      0,
  speedTier:      0,
  currentTickMs:  SPEED_TIERS[0].tickMs,
  highScore:      isNaN(savedHigh) ? 0 : savedHigh,
  phase:         'playing',
};
```

### Hook C — src/main.js accumulator

The loop in `src/main.js` must reference `state.currentTickMs` instead of the
static `TICK_MS` import so that speed tier changes take effect immediately:

```js
// Before (static speed):
while (accumulated >= TICK_MS) {
  tick();
  accumulated -= TICK_MS;
}

// After (dynamic speed):
while (accumulated >= state.currentTickMs) {
  tick();
  accumulated -= state.currentTickMs;
}
```

---

## Integration with Renderer

`src/renderer.js` must read and display:

- `state.score` — current score (points)
- `state.highScore` — all-time high score (points)

Display positions are at the renderer's discretion; recommended: score top-left,
high score top-right, both rendered on every frame regardless of game phase.

---

## Consequences

| Concern | Decision |
|---------|----------|
| Scoring granularity | Integer points only (`Math.round` applied to multiplied value) |
| Tier calculation | `findLastIndex` scan over 3-element array — O(1) in practice |
| Speed change timing | Immediate on food-eat tick, effective next `update()` call |
| High-score writes | Synchronous, inside `tick()`, only when score improves |
| `TICK_MS` constant | Kept for backwards compatibility; initial value = tier-0 tickMs |
| `foodEaten` vs `score` | Separated so score formula can change without affecting tier logic |
