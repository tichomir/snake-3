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
### Sprint 5 | 2026-03-16 | ✅ done | 13 SP
**Goal:** [Phase: Game States & UI]
Build all four game states — Start, Playing, Paused, and Game Over — with appropriate screens, transitions, and a state machine. Implement pause toggling, Game Over high score comparison, and Play Again restart without a page reload.

Deliverables:
- Start screen with title, high score display, and Start Game button
- Paused overlay with Resume button and P-key toggle
- Game Over screen showing final score, high score, congratulatory message on new record, and Play Again button
- State machine managing transitions between all four game states
- Keyboard-navigable UI elements meeting WCAG AA colour contrast ratios

**Delivered:**
- ✅ Design game state machine architecture — Software Architect (⚡ Quick, 2 SP)
- ✅ Implement game state machine and Start/Paused/Game Over screens — Frontend Developer (◉ Deep, 8 SP)
- ✅ Write integration and unit tests for state machine and UI screens — Qa Engineer (◈ Standard, 3 SP)

---
### Sprint 6 | 2026-03-16 | ✅ done | 27 SP
**Goal:** [Phase: Rendering & UX Polish]
Complete the visual layer with alternating grid shading, differentiated snake head rendering, styled food cells, responsive canvas scaling from 360px to 1920px, validated 60 fps performance, and swipe gesture support for touch devices.

Deliverables:
- Alternating two-shade grid background rendered on canvas
- Styled snake with head visually differentiated from body segments, and styled food cell
- Responsive canvas scaling with CSS and JS resize handling across 360px–1920px viewports
- Touch swipe gesture handler for direction control on mobile devices
- 60 fps performance profiling results across Chrome, Firefox, Safari, and Edge (latest 2 versions each)
- Load-time verification confirming sub-1-second initial page load

**Delivered:**
- ✅ Design rendering and UX polish architecture — Software Architect (⚡ Quick, 2 SP)
- ✅ Implement alternating grid shading and styled snake/food rendering — Frontend Developer (◈ Standard, 3 SP)
- ✅ Implement responsive canvas scaling and touch swipe gesture handler — Frontend Developer (◉ Deep, 5 SP)
- ✅ Profile 60 fps performance and verify sub-1-second load time — Qa Engineer (◉ Deep, 5 SP)
- ✅ Fix: Complete rendering and UX polish architecture ADR — Software Architect (◈ Standard, 3 SP)
- ✅ Fix: Verify and complete renderer.js implementation after truncated write — Frontend Developer (◈ Standard, 3 SP)
- ✅ Fix: canvas responsive scaling not implemented in CSS or main.js — Frontend Developer (◈ Standard, 3 SP)
- ✅ Fix: touch swipe gesture handler missing or not wired in input.js — Frontend Developer (◈ Standard, 3 SP)

---
### Sprint 7 | 2026-03-16 | ✅ done | 30 SP
**Goal:** [Phase: Testing & Release]
Conduct end-to-end functional testing across all target browsers, perform an accessibility audit, run performance regression checks, resolve identified bugs, and produce a production-ready minified single-folder build with complete documentation.

Deliverables:
- Cross-browser test report covering Chrome, Firefox, Safari, and Edge (latest 2 versions each)
- Accessibility audit report confirming WCAG AA keyboard navigation and colour contrast compliance
- Resolved bug list from the testing phase with severity classification
- Minified, single-folder production build requiring no build tool for end users
- Final README with gameplay instructions and embedding guide for the developer persona

**Delivered:**
- ✅ Define cross-browser and accessibility test plan — Software Architect (⚡ Quick, 2 SP)
- ✅ Execute cross-browser functional tests, accessibility audit, and performance regression; produce reports — Qa Engineer (◉ Deep, 5 SP)
- ✅ Resolve bugs identified during testing phase — Frontend Developer (◉ Deep, 5 SP)
- ✅ Produce minified single-folder production build and final README — Devops Engineer (◈ Standard, 3 SP)
- ✅ Fix: Incomplete cross-browser functional tests, accessibility audit, and performance regression reports — Qa Engineer (◈ Standard, 3 SP)
- ✅ Fix: Missing aria role and keyboard instructions on canvas element — Developer (◈ Standard, 3 SP)
- ✅ Fix: unresolved cross-browser functional test failures (F-01–F-46) — Frontend Developer (◈ Standard, 3 SP)
- ✅ Fix: accessibility audit failures against WCAG 2.1 AA — Frontend Developer (◈ Standard, 3 SP)
- ✅ Fix: performance regressions identified in performance-regression-report.md — Frontend Developer (◈ Standard, 3 SP)

---
### Sprint 8 — CORS Bug Investigation | 2026-03-17 | ✅ done | 5 SP
**Goal:** Investigate bugs, as I can't actually access the MVP. 

Here are the console outputs from the browser

index.html:1 Access to script at 'file:///Users/t.hadzhiev/coding/test6/src/main.js' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: chrome, chrome-extension, chrome-untrusted, data, http, https, isolated-app.Understand this error
index.html:47  GET file:///Users/t.hadzhiev/coding/test6/src/main.js net::ERR_FAILED

**Delivered:**
- ✅ Diagnose and fix CORS/file-protocol loading failure — Devops Engineer (◈ Standard, 3 SP)
- ✅ Verify game loads and is fully playable after fix — Qa Engineer (⚡ Quick, 2 SP)

---
