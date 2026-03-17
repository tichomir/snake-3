# ADR-005: Configuration Architecture and Color Theming

**Date:** 2026-03-17
**Status:** Accepted
**Author:** Software Architect

---

## Context

The game currently hard-codes all colors inside a private `COLORS` object at the top of `src/renderer.js`. There is no mechanism for users or embedders to change the visual theme. This ADR defines how a configuration system should be added to allow color customization without breaking the no-build-step, no-external-dependency constraint.

---

## Decision

### Config Format: `src/config.js` — a plain ES module

A new file `src/config.js` exports a single mutable `CONFIG` object. It is a JavaScript module (not JSON) because:

- The project already uses ES modules throughout (`import`/`export`).
- A `.js` config can ship with inline comments explaining each key — JSON cannot.
- No JSON-fetch plumbing is needed; the browser module loader handles it with the same zero-dependency approach used everywhere else.
- URL-param overrides were considered but rejected: they are invisible to users without documentation, create ugly sharable URLs, and are harder to validate at load time.

### Runtime mutation model

`CONFIG` is exported as a plain object. At startup `main.js` (or any bootstrap shim) may overwrite individual keys before the first render. The renderer reads from `CONFIG` on every frame, so any in-place mutation takes effect on the next draw — enabling a live-preview settings panel in a future sprint without architectural changes.

### Settings UI: deferred

A settings panel (in-game overlay or separate screen) is **out of scope for this sprint**. The config module is designed to be consumed by such a panel later. For now, colors can be changed by editing `src/config.js` directly or by mutating `CONFIG` from `main.js` before the first tick.

---

## Config Schema

File: **`src/config.js`**

```js
/**
 * Game configuration.
 * All color values must be valid CSS color strings.
 * Edit this file to change the visual theme or game constants.
 */
export const CONFIG = {

  // ── Game constants ────────────────────────────────────────────────────────
  // Changing these values resizes the grid and alters gameplay speed.
  // GRID_COLS and GRID_ROWS must be positive integers ≥ 5.
  // CELL_SIZE must produce a canvas that fits within the host element.
  // TICK_MS controls gameplay speed: lower = faster; recommended range 80–300.

  /** Number of columns in the grid */
  gridCols: 20,

  /** Number of rows in the grid */
  gridRows: 20,

  /** Pixel width/height of each grid cell */
  cellSize: 20,

  /** Milliseconds between game-logic ticks (lower = faster snake) */
  tickMs: 150,

  // ── Color theme ──────────────────────────────────────────────────────────
  // Each value is a CSS color string (hex, rgb(), hsl(), named color, etc.)

  colors: {
    /** Solid fill for start / game-over / paused screens background */
    background:  '#1a1a2e',

    /** Lighter cell in the checkerboard grid */
    gridLight:   '#1e1e38',

    /** Darker cell in the checkerboard grid */
    gridDark:    '#161628',

    /** Snake body segments */
    snake:       '#4ecca3',

    /** Snake head (distinct from body) */
    snakeHead:   '#f5a623',

    /** Eye dots on the snake head */
    snakeEye:    '#0a0a1a',

    /** Food pickup circle */
    food:        '#e94560',

    /** HUD text and overlay labels */
    text:        '#ffffff',

    /** Semi-transparent overlay behind pause / game-over dialogs */
    overlay:     'rgba(0,0,0,0.75)',

    /** Button fill (normal state) */
    button:      '#4ecca3',

    /** Button label text */
    buttonText:  '#0a0a1a',

    /** Button fill when focused (keyboard/gamepad navigation) */
    buttonFocus: '#f5a623',
  },
};
```

### Game constants inventory

| Key | Type | Default | Valid range | Description |
|---|---|---|---|---|
| `gridCols` | integer | `20` | ≥ 5 | Number of grid columns; canvas width = `gridCols × cellSize` |
| `gridRows` | integer | `20` | ≥ 5 | Number of grid rows; canvas height = `gridRows × cellSize` |
| `cellSize` | integer (px) | `20` | 10–40 | Pixel size of each cell; affects canvas dimensions and rendering sizes |
| `tickMs` | integer (ms) | `150` | 80–300 | Game-logic tick interval; controls base snake speed |

> **Note:** `constants.js` currently hard-codes these values as module-level exports. The implementation task is to have `constants.js` (or the modules that import it) read from `CONFIG` instead, so that embedders can override grid size and speed before the game starts.

### Color inventory with WCAG contrast ratios

All ratios are relative to the element's immediate background. Graphical elements require ≥ 3:1 (WCAG 2.1 AA Non-Text); text requires ≥ 4.5:1 (WCAG 2.1 AA Normal Text).

| Key | Default | Used for | Background | Contrast ratio | WCAG AA |
|---|---|---|---|---|---|
| `colors.background` | `#1a1a2e` | Non-game screen fill | — | — | (base) |
| `colors.gridLight` | `#1e1e38` | Checkerboard even cells | `#1a1a2e` | ~1.1:1 | subtle grid (decorative) |
| `colors.gridDark` | `#161628` | Checkerboard odd cells | `#1a1a2e` | ~1.1:1 | subtle grid (decorative) |
| `colors.snake` | `#4ecca3` | Body segments on grid | grid (~`#1e1e38`) | ~10:1 | ✓ |
| `colors.snakeHead` | `#f5a623` | Head fill on grid | grid (~`#1e1e38`) | ~7.7:1 | ✓ |
| `colors.snakeEye` | `#0a0a1a` | Eye dots on head | `#f5a623` (snakeHead) | >9:1 | ✓ |
| `colors.food` | `#e94560` | Food circle on grid | grid (~`#1e1e38`) | ~4.7:1 | ✓ |
| `colors.text` | `#ffffff` | HUD score, overlay labels | `#1a1a2e` / overlay | ~15.9:1 | ✓ |
| `colors.overlay` | `rgba(0,0,0,0.75)` | Pause / game-over overlay | game board | effective dark | ✓ |
| `colors.button` | `#4ecca3` | Button fill (normal) | overlay / `#1a1a2e` | ~9.5:1 | ✓ |
| `colors.buttonText` | `#0a0a1a` | Button label text | `#4ecca3` / `#f5a623` | >9:1 | ✓ |
| `colors.buttonFocus` | `#f5a623` | Button fill (focused) | overlay / `#1a1a2e` | ~7.7:1 | ✓ |

> **Important:** When overriding colors, verify that your replacement values maintain the contrast ratios above. The checkerboard grid colors (`gridLight`/`gridDark`) are intentionally very close together — they are decorative elements and are exempt from contrast requirements under WCAG 2.1 SC 1.4.11.

---

## How Config Is Consumed

### constants.js

`constants.js` re-exports game constants derived from `CONFIG`, so all downstream modules pick up user overrides automatically:

```js
import { CONFIG } from './config.js';

export const GRID_COLS = CONFIG.gridCols;
export const GRID_ROWS = CONFIG.gridRows;
export const CELL_SIZE = CONFIG.cellSize;
export const TICK_MS   = CONFIG.tickMs;
// DIRECTION and CELL_STATE are unchanged — they are not user-configurable
```

Because `constants.js` is a module, its exports are evaluated once at import time. Therefore `CONFIG` values **must** be overridden before any game module is first imported. Overrides applied after module initialisation will not be reflected in `GRID_COLS` etc., though color changes (read per-frame) will still take effect immediately.

### renderer.js

`renderer.js` imports `CONFIG` and replaces its private `COLORS` constant with `CONFIG.colors`:

```js
// Before (private, hard-coded):
const COLORS = { background: '#1a1a2e', ... };

// After (reads from config module):
import { CONFIG } from './config.js';
// Use CONFIG.colors.background, CONFIG.colors.snake, etc. throughout
```

Because `CONFIG.colors` is read on every call to `render()`, any mutation made between frames (e.g. from a settings panel) takes effect immediately with no extra wiring.

### main.js (optional pre-start override)

```js
import { CONFIG } from './src/config.js';

// Override any key before the game loop starts:
CONFIG.colors.snake = '#00ff99';
CONFIG.tickMs = 120;  // faster base speed
```

### Future settings UI

A settings panel would:
1. Render color pickers backed by `CONFIG.colors` values.
2. Write user selections directly into `CONFIG.colors`.
3. Optionally persist to `localStorage` and reload on startup:

```js
// persist
localStorage.setItem('snakeConfig', JSON.stringify(CONFIG.colors));

// restore at startup (in main.js, before first render)
const saved = localStorage.getItem('snakeConfig');
if (saved) Object.assign(CONFIG.colors, JSON.parse(saved));
```

---

## Alternatives Considered

| Option | Rejected reason |
|---|---|
| `config.json` loaded via `fetch()` | Requires a server (breaks file:// usage); adds async complexity |
| URL query params (`?snake=%234ecca3`) | Not user-friendly; hard to discover; requires encoding |
| Inline CSS custom properties | Canvas drawing ignores CSS variables; would need a bridge |
| Separate settings screen (this sprint) | Out of scope; deferred to the next sprint |

---

## Consequences

- **Positive:** Zero new dependencies; trivially extendable; live-preview-ready.
- **Positive:** `renderer.js` becomes theme-agnostic — all color decisions live in one place.
- **Positive:** Embedders can override colors programmatically before page load.
- **Negative:** Changing colors still requires editing a `.js` file (no GUI yet). Acceptable for this sprint.
- **Negative:** No validation that CSS color strings are valid; invalid values silently produce black. A validator can be added in the settings-panel sprint.

---

## Implementation Checklist (for Frontend Developer)

1. Create `src/config.js` with the full schema defined above (game constants + color theme).
2. Update `constants.js` to import `CONFIG` and re-export `GRID_COLS`, `GRID_ROWS`, `CELL_SIZE`, and `TICK_MS` from it (keep `DIRECTION` and `CELL_STATE` unchanged).
3. In `renderer.js`, add `import { CONFIG } from './config.js'` and replace all `COLORS.*` references with `CONFIG.colors.*`. Remove the local `const COLORS = { … }` block.
4. Smoke-test that the game renders identically with default config values.
5. Verify that mutating `CONFIG.colors.snake` at runtime causes the new color to appear on the next rendered frame.
6. Update `index.html` if `src/config.js` needs to be listed as a module (it will be transitively imported, so no change is expected).
