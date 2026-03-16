# ADR-004: Rendering & UX Polish Architecture

**Date:** 2026-03-16
**Status:** Accepted
**Author:** Software Architect

---

## Context

Sprint 6 adds the full visual and UX polish layer to the Snake game. The existing
renderer (`src/renderer.js`) implements a functional but minimal visual style:
solid background, plain grid lines, flat-colour snake and food cells, and a fixed
400×400 canvas. This ADR specifies decisions for:

1. Alternating grid shading
2. Differentiated snake head rendering
3. Styled food cells
4. Responsive canvas scaling (360 px – 1920 px viewports)
5. Touch swipe gesture support for mobile
6. 60 fps performance constraints
7. Load-time constraint (sub-1-second initial page load)

---

## Decision 1: Alternating Grid Background Shading

### Chosen

Two-tone checkerboard pattern for the grid background: even cells (`(col + row) % 2 === 0`)
drawn in `COLORS.gridA`; odd cells drawn in `COLORS.gridB`. Grid lines are removed
in favour of the colour differentiation alone — they add per-cell overdraw with no
clarity benefit once the alternating shade is in place.

### Rationale

- A checkerboard pattern makes cell boundaries immediately legible without grid
  lines, which reduces total draw calls per frame from `(GRID_COLS + GRID_ROWS + 2)`
  line segments to zero.
- The two shades stay close in value (dark navy palette) so the background recedes
  and the snake/food pop forward with high contrast.
- Removing grid lines removes 42 `beginPath`/`stroke` calls per frame — measurable
  saving at 60 fps.

### Colour values

```js
COLORS.gridA = '#16213e';   // existing 'grid' colour — keep as-is
COLORS.gridB = '#1a2244';   // slightly lighter; chosen to pass WCAG AA with text overlay
```

### Implementation note

Replace the current background `fillRect` + loop of `stroke()` calls in
`renderGameBoard` with a double `for` loop over all cells, alternating fill colour:

```js
for (let col = 0; col < GRID_COLS; col++) {
  for (let row = 0; row < GRID_ROWS; row++) {
    ctx.fillStyle = (col + row) % 2 === 0 ? COLORS.gridA : COLORS.gridB;
    ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
}
```

Total fill operations: 400 (one per cell). This replaces ~43 canvas state changes
plus strokes and is faster in practice because `fillRect` batches well in all major
browser GPU pipelines.

---

## Decision 2: Differentiated Snake Head Rendering

### Chosen

The head segment is drawn with a distinct colour (`COLORS.snakeHead = '#f5a623'`,
already defined) **and** a circular inner glow effect: a 2 px inset arc drawn with
`strokeStyle = 'rgba(255,255,255,0.35)'` after the fill. Body segments continue to
use flat `fillRect`.

### Rationale

- A colour difference alone (teal body vs amber head) is already established in the
  existing code from Sprint 5. This sprint adds the arc detail to make the head
  unambiguous at a glance without requiring the player to trace the body.
- The arc is drawn with `ctx.arc` at cell-centre radius `(CELL_SIZE / 2 - 3)` — no
  additional state exports needed; the renderer owns this detail.
- A white semi-transparent ring avoids hard-coding a third named colour.

### Implementation note

After filling the head rect, draw the ring:

```js
const cx = head.x * CELL_SIZE + CELL_SIZE / 2;
const cy = head.y * CELL_SIZE + CELL_SIZE / 2;
ctx.beginPath();
ctx.arc(cx, cy, CELL_SIZE / 2 - 3, 0, Math.PI * 2);
ctx.strokeStyle = 'rgba(255,255,255,0.35)';
ctx.lineWidth   = 2;
ctx.stroke();
```

Cost: one `arc` + one `stroke` per frame — negligible.

---

## Decision 3: Styled Food Cell

### Chosen

Food is drawn as a filled circle centred in the cell (radius `CELL_SIZE / 2 - 2`)
rather than a square `fillRect`. Colour stays `COLORS.food = '#e94560'`.

### Rationale

- A circle creates clear visual differentiation from the square snake segments,
  reducing the cognitive load of identifying the target at speed.
- No additional sprite asset is required — pure Canvas 2D API.
- Circle rendering uses the same `arc` primitive as the head ring, keeping the draw
  call count low.

### Implementation note

```js
ctx.fillStyle = COLORS.food;
ctx.beginPath();
ctx.arc(
  state.food.x * CELL_SIZE + CELL_SIZE / 2,
  state.food.y * CELL_SIZE + CELL_SIZE / 2,
  CELL_SIZE / 2 - 2,
  0, Math.PI * 2
);
ctx.fill();
```

---

## Decision 4: Responsive Canvas Scaling

### Chosen

The canvas logical resolution stays fixed at `GRID_COLS × CELL_SIZE` × `GRID_ROWS × CELL_SIZE`
(400 × 400). The canvas is scaled to fit within the viewport via CSS `max-width` +
`aspect-ratio`, supplemented by a JS `ResizeObserver` that updates `canvas.width`
and `canvas.height` only when a responsive breakpoint is crossed.

### Rationale for fixed logical resolution

- All coordinate arithmetic in `game.js`, `renderer.js`, and tests uses
  `GRID_COLS / GRID_ROWS / CELL_SIZE`. Changing these constants would break the
  entire coordinate system.
- CSS scaling (`width: 100%; max-width: 600px; aspect-ratio: 1`) gives the browser
  the scaling job, which is hardware-accelerated and zero-cost to JS.
- A `ResizeObserver` on `window` corrects the hit-testing scale factors (`scaleX`,
  `scaleY`) in `main.js` after viewport size changes — already partially implemented
  there via `canvas.getBoundingClientRect()`.

### CSS strategy

```css
#game-canvas {
  display: block;
  margin: 0 auto;
  width: min(100vw, 100vh, 600px);   /* square; never exceeds 600 px or viewport */
  aspect-ratio: 1 / 1;
  image-rendering: pixelated;        /* crisp integer scaling */
}
```

`image-rendering: pixelated` prevents bilinear blurring at fractional scale factors
common on high-DPI displays and small screens.

### JS resize handling

`main.js` already reads `canvas.getBoundingClientRect()` on every click event.
A `ResizeObserver` must also be attached at init to recalculate `scaleX`/`scaleY`
whenever the layout reflows:

```js
const ro = new ResizeObserver(() => {
  // No canvas pixel-size change — only the CSS display size changed.
  // scaleX/scaleY are recalculated on demand in the click handler,
  // so no explicit action is needed here unless touch hit-testing is cached.
});
ro.observe(canvas);
```

In practice `scaleX`/`scaleY` are already read fresh from `getBoundingClientRect()`
on each pointer event, so the `ResizeObserver` callback is a no-op for pointer
events. It is nonetheless registered to future-proof cached coordinate paths.

### Viewport range

| Viewport width | Rendered canvas CSS size | Scale factor |
|:--------------:|:------------------------:|:------------:|
| 360 px         | 360 × 360 px             | 0.9×         |
| 400 px         | 400 × 400 px             | 1.0×         |
| 768 px         | 600 × 600 px (capped)    | 1.5×         |
| 1920 px        | 600 × 600 px (capped)    | 1.5×         |

The 600 px cap prevents the game board from becoming comically large on desktop
while keeping cell targets touch-friendly on mobile.

---

## Decision 5: Touch Swipe Gesture Handler

### Chosen

A four-directional swipe detector is added to `src/input.js` using `touchstart` /
`touchend` events. Minimum swipe distance threshold: **30 px** (CSS pixels).
Swipe direction maps to the same `DIRECTION` enum values as keyboard input; the
existing reverse-prevention guard in `src/input.js` applies unchanged.

### Rationale

- `touchstart` + `touchend` (no `touchmove` needed) keeps the handler stateless
  between events and avoids `passive: false` listener overhead.
- 30 px threshold filters out tap jitter on low-precision touch screens while
  remaining responsive for quick directional swipes.
- Reusing the existing `onDirectionChange` callback in `bindInput` means zero
  changes to `game.js` or `main.js`.

### Algorithm

```
touchstart → record { startX, startY }
touchend   → dx = endX - startX, dy = endY - startY
           → if |dx| < 30 && |dy| < 30: ignore (tap)
           → if |dx| >= |dy|:
               dx > 0 → RIGHT else LEFT
             else:
               dy > 0 → DOWN  else UP
           → call onDirectionChange(swipeDir)
```

Diagonal swipes resolve to the dominant axis, matching the feel of most mobile
Snake implementations.

### Preventing page scroll during play

```js
canvas.addEventListener('touchstart', handler, { passive: false });
canvas.addEventListener('touchend',   handler, { passive: false });
```

`event.preventDefault()` is called inside the handler when the touch begins on the
canvas, preventing the viewport from scrolling during play. `passive: false` is
required to allow `preventDefault` on modern browsers.

---

## Decision 6: 60 fps Performance Target

### Constraints

- Frame budget: **16.67 ms** (60 fps).
- Snake tick logic runs at most once per ~90–150 ms (speed tier dependent); it
  occupies < 0.1 ms of the frame budget.
- All per-frame work is in `render()` — target < **5 ms** render time to leave
  headroom for browser compositing.

### Render cost analysis

| Operation | Call count per frame | Estimated cost |
|-----------|:--------------------:|:--------------:|
| Grid fill (400 `fillRect`) | 400 | ~0.5 ms |
| Body segments `fillRect` | up to 400 | ~0.5 ms |
| Head `fillRect` + `arc`/`stroke` | 1 + 1 | < 0.1 ms |
| Food `arc`/`fill` | 1 | < 0.1 ms |
| Text (`fillText`) | 1–4 | < 0.1 ms |
| Overlay `fillRect` (pause/over) | 0 or 1 | < 0.1 ms |
| **Total** | | **< 2 ms** |

This leaves > 14 ms margin — no optimisation (dirty-rect, off-screen canvas,
double buffering) is warranted at this grid size.

### Performance profiling plan

Chrome DevTools Performance panel will be used to record 5-second gameplay clips
and verify:
- No frame takes > 16 ms (no red bars in the frame chart).
- `render()` consistently appears under the `rAF` callback with < 5 ms self-time.

Same check is replicated manually in Firefox, Safari, and Edge (latest 2 releases
each) using each browser's built-in profiler.

### Off-screen canvas (rejected)

Pre-rendering the static grid to an off-screen canvas and `drawImage`-ing it each
frame was evaluated. At 400 cells the live fill loop is faster than a `drawImage`
call on most GPU backends because `drawImage` issues a texture upload on every frame
when the off-screen canvas has been marked dirty. Only beneficial if the grid were
static and never redrawn after init — not the case here (grid shading depends on no
game state, so it could be pre-rendered, but the saving is immeasurable and the
added code complexity is not justified).

---

## Decision 7: Sub-1-Second Load Time

### Target

Initial page load must complete (DOMContentLoaded + all scripts evaluated +
first frame painted) in < 1 second on a standard Wi-Fi connection.

### Why it is trivially met

- No network-fetched assets beyond `index.html` (~1 KB), `style.css` (~0.5 KB),
  `main.js` (~4 KB), and `src/*.js` modules (~15 KB combined). Total transfer
  < 25 KB uncompressed, < 10 KB gzipped.
- No blocking third-party scripts, no images, no fonts.
- Canvas init and first frame paint happen synchronously in the first `rAF` callback.

### Validation approach

Chrome DevTools Lighthouse "Performance" audit run against `npx serve .` on
localhost. Target: LCP < 1 s, FCP < 1 s. Any regression that pushes LCP above 1 s
(e.g., a large sprite sheet added to `assets/`) must be caught before merge.

---

## State / Constants Changes

No new fields are added to `state` in `src/game.js`. No changes to `src/constants.js`
are required beyond the two new colour entries added to the `COLORS` object inside
`src/renderer.js`:

```js
// src/renderer.js — additions to COLORS
gridA: '#16213e',   // replaces 'grid' (same value, renamed for clarity)
gridB: '#1a2244',   // new alternating shade
```

The existing `grid` key in `COLORS` may be aliased to `gridA` for backwards
compatibility with any external references, or removed after verifying no other
module imports it (it is private to `renderer.js`).

---

## Module Responsibilities (updated)

| Concern | Module | Change |
|---------|--------|--------|
| Alternating grid shading | `src/renderer.js` | Replace bg fill + grid-line loop |
| Head ring detail | `src/renderer.js` | Add `arc`/`stroke` after head `fillRect` |
| Circular food | `src/renderer.js` | Replace `fillRect` with `arc`/`fill` |
| Responsive canvas CSS | `style.css` | Add `min()` width + `aspect-ratio` |
| Resize handling | `src/main.js` | Attach `ResizeObserver` (no-op body) |
| Touch swipe | `src/input.js` | Add `touchstart`/`touchend` handler |
| Performance budget | `src/renderer.js` | No code change; profiling validates |

---

## Consequences Summary

| Concern | Decision |
|---------|----------|
| Grid rendering | 400 `fillRect` alternating two shades; grid lines removed |
| Snake head | Amber fill + semi-transparent white arc ring |
| Food | Red circle (`arc`/`fill`); no sprite asset |
| Canvas sizing | Fixed 400×400 logical px; CSS `min()` + `aspect-ratio` scales display |
| Mobile input | `touchstart`/`touchend` swipe, 30 px threshold, axis-dominant resolution |
| Frame budget | < 2 ms render estimated; profiled in 4 browsers × 2 versions |
| Load time | < 25 KB total; sub-1 s met without special optimisation |
| New dependencies | None |
