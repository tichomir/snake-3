# Snake 3 — Project Intelligence

_Auto-maintained by PersonaForge. Updated after every sprint._
_Read this file BEFORE `.persona-snapshot.md` and BEFORE any exploration._
_It tells you what has been built, in what order, and key decisions made._

## Project Context

Test project

---

## Sprint History
### Sprint 1 | 2026-03-16 | ✅ done | 18 SP
**Goal:** Need a tiny Hello World HTML app to test the whole workflow

**Delivered:**
- ✅ Design Hello World app structure and workflow — Software Architect (⚡ Quick, 2 SP)
- ✅ Implement Hello World HTML page — Frontend Developer (⚡ Quick, 2 SP)
- ✅ Set up CI/CD pipeline for build, test, and deploy — Devops Engineer (◉ Deep, 5 SP)
- ✅ Write and run smoke tests for the Hello World page — Qa Engineer (◈ Standard, 3 SP)
- ✅ Fix: README.md not updated with Hello World app description — Software Architect (◈ Standard, 3 SP)
- ✅ Fix: Complete smoke tests that hit max-turns limit — Qa Engineer (◈ Standard, 3 SP)

---
### Sprint 2 | 2026-03-16 | ✅ done | 20 SP
**Goal:** [Phase: Project Setup & Architecture]
Establish the project scaffold, coding conventions, and core architecture. Define the game loop pattern, module structure, canvas/rendering approach, and set up a lightweight local dev environment with no external runtime dependencies.

Deliverables:
- Repository initialised with folder structure (src, assets, tests)
- index.html shell with canvas element
- Core game loop skeleton using requestAnimationFrame
- README with dev setup instructions
- Architecture decision record (ADR) for no-dependency, canvas-based rendering

**Delivered:**
- ✅ Define project folder structure and architecture ADR — Software Architect (⚡ Quick, 2 SP)
- ✅ Implement index.html shell with canvas and game loop skeleton — Frontend Developer (◈ Standard, 3 SP)
- ✅ Write README with dev setup instructions — Devops Engineer (⚡ Quick, 1 SP)
- ✅ Smoke-test project scaffold and game loop in CI — Qa Engineer (◉ Deep, 5 SP)
- ✅ Fix: Complete project folder structure and architecture ADR — Software Architect (◈ Standard, 3 SP)
- ✅ Fix: Complete game loop skeleton and src/main.js creation — Frontend Developer (◈ Standard, 3 SP)
- ✅ Fix: Complete README dev setup instructions — Devops Engineer (◈ Standard, 3 SP)

---
### Sprint 3 | 2026-03-16 | ✅ done | 18 SP
**Goal:** [Phase: Core Gameplay Engine]
Implement the fundamental game mechanics including the grid model, snake data structure, continuous movement, direction control with reverse-prevention, collision detection for walls and self, and food spawning on unoccupied cells.

Deliverables:
- 20x20 grid model with cell state management
- Snake initialisation at centre (length 3) with continuous movement
- Arrow key and WASD input handler with reverse-direction guard
- Food spawning logic targeting a random unoccupied cell
- Wall and self-collision detection triggering game-over state
- Unit tests covering movement, collision, and food placement edge cases

**Delivered:**
- ✅ Design grid model and snake data structures — Software Architect (⚡ Quick, 2 SP)
- ✅ Implement core gameplay engine: grid, snake, movement, input, food, and collision — Frontend Developer (◉ Deep, 8 SP)
- ✅ Write unit tests for movement, collision, and food placement — Qa Engineer (◉ Deep, 5 SP)
- ✅ Fix: Complete adr-002-game-data-structures.md content — Software Architect (◈ Standard, 3 SP)

---
### Sprint 4 | 2026-03-16 | ✅ done | 16 SP
**Goal:** [Phase: Scoring & Progression]
Implement the scoring system including base points per food eaten, speed-bonus multipliers tied to progression tiers, progressive speed increases every 5 food items consumed, and localStorage persistence for high score across sessions.

Deliverables:
- Score calculation: 10pts x multiplier (x1.0 / x1.5 / x2.0) based on current speed tier
- Speed increment logic triggered every 5 food items eaten
- localStorage read/write for high score persistence
- Score and high score display rendered during active gameplay
- Unit tests for scoring logic and speed-tier transition edge cases

**Delivered:**
- ✅ Design scoring system and speed-tier architecture — Software Architect (⚡ Quick, 2 SP)
- ✅ Implement scoring, speed-tier progression, and localStorage persistence — Frontend Developer (◉ Deep, 5 SP)
- ✅ Write unit tests for scoring logic and speed-tier edge cases — Qa Engineer (◈ Standard, 3 SP)
- ✅ Fix: Complete scoring system and speed-tier architecture design — Software Architect (◈ Standard, 3 SP)
- ✅ Fix: scoring test file was created but never executed or verified — Qa Engineer (◈ Standard, 3 SP)

---
