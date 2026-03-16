# ADR-002: Grid Model and Snake Data Structures

**Date:** 2026-03-16
**Status:** Accepted
**Author:** Software Architect

---

## Context

Sprint 3 requires implementing the core gameplay engine. The frontend developer
needs a precise specification of the data structures and algorithms before writing
any code. This ADR defines the canonical shape of every game-state object so that
`src/game.js`, `src/input.js`, and `src/main.js` can be implemented independently
and consistently.

---

## Grid Model

### Dimensions

```
GRID_COLS = 20
GRID_ROWS = 20
```

The grid is a logical coordinate space only. No 2-D array is allocated; cell state
is derived from the snake segment list and food position at query time. This avoids
a synchronisation burden (keeping an array in step with the snake list) and keeps
the authoritative state in one place.

### Cell State (derived, not stored)

| State  | Definition |
|--------|------------|
| `empty`  | No snake segment occupies `{x, y}` and it is not the food position |
| `snake`  | `{x, y}` matches any element of `state.snake` |
| `food`   | `{x, y}` matches `state.food` |

The renderer and collision logic query state by checking these conditions in order.

### Coordinate Convention

- Origin `{x:0, y:0}` is the **top-left** cell.
- `x` increases rightward (columns), `y` increases downward (rows).
- Valid range: `0 ≤ x < GRID_COLS`, `0 ≤ y < GRID_ROWS`.

---

## Game State Object

All mutable runtime state lives in a single plain-object `state` owned by
`src/game.js` and exported for use by the renderer and main loop.

```js
// src/game.js — canonical state shape
const state = {
  // Snake: ordered array of {x, y} segments.
  // Index 0 = head. Tail = last element.
  snake: [
    { x: 11, y: 10 },   // head  (centre-right of 20x20 grid)
    { x: 10, y: 10 },   // body
    { x: 9,  y: 10 },   // tail
  ],

  // Current travel direction. Never null after init.
  direction: DIRECTION.RIGHT,

  // Buffered next direction from input (applied at next tick).
  // Null means no input received since last tick.
  nextDirection: null,

  // Position of the current food item. Exactly one food exists at all times.
  food: { x: <rand>, y: <rand> },

  // When true, the snake grows by one on the next tick instead of shrinking tail.
  pendingGrow: false,

  // Integer score (incremented each time food is eaten).
  score: 0,

  // 'playing' | 'over'
  phase: 'playing',
};
```

---

## Direction Enum

```js
// src/constants.js
export const DIRECTION = Object.freeze({
  UP:    { x:  0, y: -1 },
  DOWN:  { x:  0, y:  1 },
  LEFT:  { x: -1, y:  0 },
  RIGHT: { x:  1, y:  0 },
});
```

Direction values are `{x, y}` delta vectors. Using delta vectors (rather than
string labels) lets the movement tick compute the new head position with a single
addition, and lets the reverse-prevention guard compare component signs without a
lookup table.

---

## Snake Initialisation

```
Centre of 20×20 grid = {x:10, y:10}

Initial snake (length 3, facing RIGHT):
  head  = {x:11, y:10}
  body  = {x:10, y:10}
  tail  = {x: 9, y:10}
```

The head is placed one cell ahead of centre so the snake has room to move right
immediately without hitting the left wall on start.

---

## Movement Tick Logic

Called once per fixed-timestep tick (150 ms, defined in `src/constants.js`):

```
1. Apply buffered direction:
     if nextDirection is not null:
       direction = nextDirection
       nextDirection = null

2. Compute new head:
     newHead = { x: snake[0].x + direction.x,
                 y: snake[0].y + direction.y }

3. Collision check (wall):
     if newHead.x < 0 || newHead.x >= GRID_COLS ||
        newHead.y < 0 || newHead.y >= GRID_ROWS:
       phase = 'over'
       return

4. Collision check (self):
     if any segment in snake equals newHead:
       phase = 'over'
       return

5. Prepend new head:
     snake.unshift(newHead)

6. Grow or shrink:
     if pendingGrow:
       pendingGrow = false          // keep tail — net length +1
     else:
       snake.pop()                  // remove tail — net length unchanged

7. Food check:
     if newHead equals food:
       pendingGrow = true
       score += 1
       spawnFood()
```

---

## Reverse-Prevention Guard

Applied in the input handler before writing `nextDirection`:

```
A direction change is valid only if:
  newDir.x !== -currentDir.x || newDir.y !== -currentDir.y

Equivalently:
  NOT (newDir.x === -direction.x AND newDir.y === -direction.y)
```

Using delta-vector directions makes this a pure numeric comparison with no enum
mapping. The check uses `direction` (the currently applied direction), not
`nextDirection`, so rapid double-taps within a single tick cannot sneak a 180°
reversal through by overwriting `nextDirection` twice.

---

## Food Spawning Algorithm

```
function spawnFood():
  candidates = all {x, y} where 0 ≤ x < GRID_COLS, 0 ≤ y < GRID_ROWS
               AND {x,y} not in snake
  pick a random element from candidates
  state.food = picked element
```

**Edge case — full grid:** If `candidates` is empty (snake fills all cells), the
game is won; set `phase = 'won'` instead of spawning food. This prevents an
infinite loop.

The candidate list is built by iterating the full grid (`20×20 = 400` cells) and
filtering out occupied positions. This is O(n) where n = grid area — acceptable for
this scale.

---

## Integration with `src/main.js` Game Loop

`src/main.js` currently contains:

```js
function update(delta) { /* game state update logic goes here */ }
function render()       { /* drawing logic goes here */ }
```

The frontend developer must wire the game modules into these hooks as follows:

```js
// main.js (updated)
import { state, tick }      from './src/game.js';
import { render as draw }   from './src/renderer.js';
import { bindInput }        from './src/input.js';
import { TICK_MS }          from './src/constants.js';

bindInput();   // attach keydown listener once on init

let accumulated = 0;

function update(delta) {
  if (state.phase !== 'playing') return;
  accumulated += delta;
  while (accumulated >= TICK_MS) {
    tick();              // one game-logic step
    accumulated -= TICK_MS;
  }
}

function render() {
  draw(ctx, state);      // renderer reads state, draws to canvas
}
```

Key integration constraints:
- `tick()` is the single authoritative function that advances game state; it is
  called from `update()` only.
- `render()` is pure — it reads `state` but never mutates it.
- `bindInput()` writes only `state.nextDirection`; it never calls `tick()` directly.
- The fixed-timestep accumulator in `update()` ensures deterministic movement speed
  regardless of frame rate.

---

## Constants (src/constants.js)

```js
export const GRID_COLS  = 20;
export const GRID_ROWS  = 20;
export const CELL_SIZE  = 20;   // pixels per cell — canvas = 400×400
export const TICK_MS    = 150;  // ms between game-logic ticks

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
```

---

## Consequences

| Concern | Decision |
|---------|----------|
| Grid representation | Derived from snake list + food position — no separate 2-D array |
| Direction type | `{x,y}` delta vector — enables arithmetic reverse-guard |
| Snake structure | Mutable array, head at index 0 |
| Growth mechanism | `pendingGrow` flag defers tail removal by one tick |
| Food spawn | O(n) candidate filter over full grid |
| State ownership | Single `state` object in `src/game.js` |
| Loop integration | `tick()` called from `update()`; `render()` is read-only |
