# ADR-001: No-Dependency, Canvas-Based Architecture for Snake 3

**Date:** 2026-03-16
**Status:** Accepted
**Author:** Software Architect

---

## Context

Snake 3 is a browser-based Snake game. The project requires a clear architecture
that is simple to run locally, easy to test, and free of external runtime
dependencies. The goal is a game that any developer can clone and run by opening
`index.html` directly in a browser — no npm install, no bundler, no server.

---

## Decision

### 1. No External Dependencies

**Chosen:** Zero runtime dependencies. Vanilla JavaScript only.

**Rationale:**
- A Snake game has no logic that requires a library — DOM, Canvas 2D API, and
  `requestAnimationFrame` are sufficient.
- External dependencies create version-drift risk, supply-chain risk, and
  mandatory tooling (bundler, lock files, node_modules).
- Keeping the runtime pure JavaScript means the game works offline and in any
  modern browser with no build step.

**Consequences:**
- No framework ergonomics (no React, no Vue). All rendering is imperative.
- Any utility code (e.g. event emitter, collision helpers) must be written in-house,
  kept small, and placed under `src/`.

---

### 2. Canvas-Based Rendering

**Chosen:** HTML5 `<canvas>` element with the 2D Context API.

**Rationale:**
- Snake is a grid-based game. Canvas allows pixel-precise, immediate-mode drawing
  without DOM node overhead for each cell.
- `fillRect` per-cell is sufficient for all visual requirements at this scope.
- Canvas decouples rendering from HTML structure — the game world is drawn, not
  described declaratively, which maps cleanly onto the game-loop pattern.

**Rejected alternatives:**
- **CSS Grid / DOM tiles** — creates hundreds of DOM nodes per frame update, adds
  style-recalc overhead, and couples game state to HTML structure.
- **WebGL** — vastly over-engineered for a 2D tile game; increases complexity with
  no visual benefit.

**Consequences:**
- All rendering code operates through `CanvasRenderingContext2D`.
- The canvas element lives in `index.html`; its size is set in `main.js` at init.

---

### 3. Game Loop via `requestAnimationFrame`

**Chosen:** `requestAnimationFrame`-based main loop with a fixed-timestep tick for
game logic.

**Rationale:**
- `requestAnimationFrame` syncs to the display refresh rate, preventing screen
  tearing and unnecessary CPU/GPU work when the tab is hidden.
- A fixed-timestep tick (e.g. one update per 150 ms) decouples snake movement
  speed from frame rate, ensuring deterministic gameplay across devices.

**Pattern:**
```
requestAnimationFrame(loop)

function loop(timestamp) {
  if (timestamp - lastTick >= TICK_MS) {
    update();
    lastTick = timestamp;
  }
  render();
  requestAnimationFrame(loop);
}
```

---

### 4. Module Breakdown

| Module | File | Responsibility |
|--------|------|----------------|
| Entry | `main.js` | Init canvas, start game loop, wire input |
| Game state | `src/game.js` | Snake position, direction, food, score, collision |
| Renderer | `src/renderer.js` | Draw grid, snake, food, score to canvas |
| Input | `src/input.js` | Keyboard event listener → direction queue |
| Constants | `src/constants.js` | Grid size, tick rate, colours |

---

### 5. Folder Structure Rationale

```
/
├── index.html          # Shell: canvas element + script tag
├── main.js             # Entry point: init + game loop
├── style.css           # Minimal canvas centering styles
├── src/                # Game logic modules
│   ├── game.js
│   ├── renderer.js
│   ├── input.js
│   └── constants.js
├── assets/             # Sprites, sounds (empty at project start)
├── tests/              # Unit tests (Vanilla JS test runner or Node assert)
├── docs/               # Architecture decision records
│   └── adr-001-architecture.md
└── ARCHITECTURE.md     # High-level architecture overview + ADR index
```

**Why separate `src/` from root:**
- `main.js` at root is the single browser entry point (`<script src="main.js">`).
- Game modules in `src/` are imported via ES module `import` statements, keeping
  concerns separated and individually testable.
- `assets/` and `tests/` are standard top-level directories with clear, conventional
  purposes.

---

### 6. Local Dev Environment

No server is required for development. Open `index.html` in a browser via `file://`.

If ES module imports cause CORS errors on `file://` (Chrome enforces this), run a
one-liner static server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

No configuration file is needed for either option.

---

## Consequences Summary

| Concern | Decision |
|---------|----------|
| Runtime dependencies | None |
| Rendering | Canvas 2D API |
| Game loop | `requestAnimationFrame` + fixed timestep |
| Module system | ES Modules (`import`/`export`) |
| Build step | None |
| Test runner | Node `assert` or lightweight vanilla runner |
| Dev server | Optional one-liner (`npx serve`) |
