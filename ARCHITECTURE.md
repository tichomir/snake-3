# Snake 3 — Architecture Overview

## Folder Structure

```
/
├── index.html          # Shell: canvas element + script tag
├── main.js             # Entry point: canvas init + game loop
├── style.css           # Minimal canvas centering styles
├── src/                # Game logic modules (ES Modules)
│   ├── game.js         # Snake state, food, collision, scoring
│   ├── renderer.js     # Canvas 2D drawing (grid, snake, food, HUD)
│   ├── input.js        # Keyboard listener → direction queue
│   └── constants.js    # Grid size, tick rate, colours
├── assets/             # Sprites and sounds (reserved; empty at project start)
├── tests/              # Unit tests
├── docs/               # Architecture decision records
│   └── adr-001-architecture.md
├── ARCHITECTURE.md     # This file
└── CLAUDE.md           # Project intelligence (sprint history)
```

## Key Architectural Decisions

| Decision | Choice | Detail |
|----------|--------|--------|
| Runtime dependencies | None | Vanilla JS only — no framework, no bundler |
| Rendering | Canvas 2D API | `fillRect` per grid cell; immediate-mode draw |
| Game loop | `requestAnimationFrame` + fixed timestep | Decouples snake speed from frame rate |
| Module system | ES Modules (`import`/`export`) | No bundler required; works via `file://` or `npx serve` |
| Build step | None | Files are deploy-ready as-is |
| Dev server | Optional (`npx serve .`) | Only needed if browser blocks `file://` ES module imports |

## Architecture Decision Records

- [ADR-001 — No-Dependency, Canvas-Based Architecture](docs/adr-001-architecture.md)

## Dev Setup

```bash
# No install required — open directly:
open index.html

# If ES module imports are blocked on file://:
npx serve .
# then visit http://localhost:3000
```
