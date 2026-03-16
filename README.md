# The Snake — Vanilla JS Canvas Game

A classic Snake game implemented in plain JavaScript using the HTML5 Canvas API. No build step, no dependencies, no framework — just open and play.

## Project Overview

The Snake is a zero-dependency browser game built with vanilla JS and the Canvas 2D API. The player controls a snake that grows as it eats food; the game ends when the snake hits a wall or itself. The project is intentionally kept dependency-free to maximise portability and keep the dev loop instant.

## Repository Structure

```
assets/        Static assets (sprites, audio — populated in later sprints)
docs/          Architecture Decision Records and design docs
src/           Game source modules (game loop, renderer, input, state)
tests/         Automated test suites
index.html     Entry point — loads the canvas shell and bootstraps the game
main.js        Top-level JS entry point
style.css      Minimal page styles
```

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Web browser | Chrome, Firefox, Safari, or Edge (latest 2 releases) | Required to play the game |
| Node.js | v18 or later | Required only to run the test suite and linter |
| npm | v9 or later | Bundled with Node.js |

Node.js is **not** needed to run the game itself — any modern browser is sufficient.

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/the-snake.git
cd the-snake

# Install dev dependencies (needed for tests and linting only)
npm install
```

## Running Locally

No build step and no local server required.

**Option A — open directly (simplest):**

1. Open `index.html` in your browser:
   - Double-click the file in your file manager, **or**
   - Navigate to `file:///path/to/the-snake/index.html` in the address bar.

**Option B — use the bundled dev server:**

```bash
npx serve .
# Then open http://localhost:3000 in your browser
```

The game starts immediately on page load.

## Running Tests

Install dependencies first (`npm install`), then:

```bash
# Run the smoke test suite
npm test

# Check JS syntax only
npm run test:syntax

# Lint the HTML
npm run lint
```

## Browser Support

Tested against the latest two stable releases of each browser:

| Browser | Minimum supported version |
|---------|--------------------------|
| Chrome  | Latest 2 releases        |
| Firefox | Latest 2 releases        |
| Safari  | Latest 2 releases        |
| Edge    | Latest 2 releases        |

All listed browsers support the Canvas 2D API and `requestAnimationFrame` natively — no polyfills are required.

## Architecture

The game uses a no-dependency, canvas-based rendering approach. See the Architecture Decision Record for the full rationale:

[ADR-001 — No-dependency, canvas-based rendering](docs/adr-001-no-dependency-canvas-rendering.md)
