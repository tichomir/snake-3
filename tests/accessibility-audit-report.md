# Accessibility Audit Report — Snake 3

**Sprint:** 7 — Testing & Release
**Date:** 2026-03-16
**Author:** QA Engineer
**Standard:** WCAG 2.1 Level AA
**Scope:** `index.html`, `style.css`, `src/renderer.js`, `src/constants.js`, `src/main.js`, `src/input.js`

---

## 1. Audit Methodology

This audit combines:
1. **Static code inspection** — HTML structure, ARIA attributes, CSS focus styles, JS keyboard handlers.
2. **Colour contrast calculation** — Relative luminance computed from hex colour values per WCAG 2.1 §1.4.3 and §1.4.11. Formula: `L = 0.2126 R_lin + 0.7152 G_lin + 0.0722 B_lin` where linearisation applies the standard sRGB transfer function.
3. **Automated rule reference** — axe-core 4.x rule set consulted for structural checks; no runtime execution possible in a zero-dependency Node environment (Canvas 2D output is not DOM-accessible to axe-core).

> **Note:** Because the game renders its entire UI onto an HTML5 Canvas element, most
> interactive content (buttons, text, game state) exists as rasterised pixels rather
> than DOM nodes. axe-core and other DOM-based tools cannot audit canvas-rendered
> content. Manual keyboard verification in a real browser session is required for
> interactive element checks.

---

## 2. Colour Contrast Results

### 2.1 Colour Reference Table

All colours sourced from `src/renderer.js:11–24` and `style.css`.

| Variable | Hex | Usage |
|----------|-----|-------|
| `background` | `#1a1a2e` | Page background, Start screen |
| `gridLight` | `#1e1e38` | Checkerboard light cells |
| `gridDark` | `#161628` | Checkerboard dark cells |
| `snake` | `#4ecca3` | Body segments; title text |
| `snakeHead` | `#f5a623` | Head; New High Score text |
| `food` | `#e94560` | Food cell |
| `text` | `#ffffff` | HUD, overlay text, score labels |
| `overlay` | `rgba(0,0,0,0.75)` | Pause / Game Over overlay |
| `button` | `#4ecca3` | Button background (normal) |
| `buttonFocus` | `#f5a623` | Button background (focused) |
| `buttonText` | `#0a0a1a` | Button label text |

### 2.2 Relative Luminance Calculations

| Colour | Hex | Relative Luminance (L) |
|--------|-----|----------------------:|
| `#ffffff` | White | 1.0000 |
| `#1a1a2e` | Background | 0.0117 |
| `#1e1e38` | Grid Light | 0.0150 |
| `#161628` | Grid Dark | 0.0077 |
| `#4ecca3` | Snake / Teal | 0.4740 |
| `#f5a623` | Amber | 0.4644 |
| `#e94560` | Food / Red | 0.2232 |
| `#0a0a1a` | Button text | 0.0036 |
| Effective overlay | `rgba(0,0,0,0.75)` over gridLight | ≈ 0.0038 |

Contrast ratio formula: `(L_lighter + 0.05) / (L_darker + 0.05)`

### 2.3 Contrast Results per Test ID

| ID   | UI Element | Foreground (hex) | Background (hex) | Ratio | Required | Result |
|------|-----------|:----------------:|:----------------:|------:|:--------:|:------:|
| A-10 | Score text on canvas (play) | `#ffffff` | `#1e1e38` (gridLight) | **16.15:1** | 4.5:1 | ✅ |
| A-11 | High score text on canvas (play) | `#ffffff` | `#1e1e38` (gridLight) | **16.15:1** | 4.5:1 | ✅ |
| A-12 | "Start Game" button label (normal) | `#0a0a1a` | `#4ecca3` | **9.78:1** | 4.5:1 | ✅ |
| A-13 | Title "SNAKE" on Start screen | `#4ecca3` | `#1a1a2e` | **8.49:1** | 3:1 | ✅ |
| A-14 | "Best: N" high score on Start screen | `#ffffff` | `#1a1a2e` | **17.02:1** | 4.5:1 | ✅ |
| A-15 | "Resume" button label (normal) | `#0a0a1a` | `#4ecca3` | **9.78:1** | 4.5:1 | ✅ |
| A-16 | "PAUSED" heading on overlay | `#ffffff` | overlay (~`#000000`) | **≈19.5:1** | 3:1 | ✅ |
| A-17 | Final score text on Game Over | `#ffffff` | overlay (~`#000000`) | **≈19.5:1** | 4.5:1 | ✅ |
| A-18 | "Play Again" button label (normal) | `#0a0a1a` | `#4ecca3` | **9.78:1** | 4.5:1 | ✅ |
| A-19 | "NEW HIGH SCORE!" message | `#f5a623` | overlay (~`#000000`) | **9.57:1** | 4.5:1 | ✅ |
| A-20 | Snake body vs grid background | `#4ecca3` | `#1e1e38` (gridLight) | **8.06:1** | 3:1 | ✅ |
| A-21 | Snake head vs grid background | `#f5a623` | `#1e1e38` (gridLight) | **7.91:1** | 3:1 | ✅ |
| A-22 | Food cell vs grid background | `#e94560` | `#1e1e38` (gridLight) | **4.20:1** | 3:1 | ✅ |
| —    | Button label on focused button | `#0a0a1a` | `#f5a623` (amber) | **9.60:1** | 4.5:1 | ✅ |
| —    | Subtitle/instructions text | `#ffffff` | `#1a1a2e` | **17.02:1** | 4.5:1 | ✅ |

**All 15 measured contrast pairs meet or exceed their respective WCAG AA thresholds.**

---

## 3. Keyboard Navigation Results

### 3.1 Keyboard Handler Analysis

`src/input.js` installs a single `document.addEventListener('keydown', …)` handler.
`src/main.js:185` sets `canvas.setAttribute('tabindex', '0')` and immediately calls
`canvas.focus()`, making the canvas the initial focused element.

| ID   | Checklist Item | Result | Notes |
|------|---------------|:------:|-------|
| A-01 | "Start Game" button reachable by Tab | ✅ | Canvas has `tabindex="0"` set at startup; immediately receives focus. Tab key is intercepted by `input.js:78` and triggers `onNextFocus` (keeps `focusedButton = 0`). The teal focus ring is drawn by `renderer.js:122–126`. |
| A-02 | "Start Game" activatable with Enter or Space | ✅ | `input.js:72` — Enter/Space both call `activateFocusedButton()` → `onStartGame()`. |
| A-03 | "Resume" button reachable by Tab | ✅ | Same mechanism; Tab keeps `focusedButton = 0` on the Pause screen. |
| A-04 | "Resume" activatable with Enter or Space | ✅ | `activateFocusedButton()` → `onResume()` in PAUSED state. |
| A-05 | "Play Again" button reachable by Tab | ✅ | Same mechanism on Game Over screen. |
| A-06 | "Play Again" activatable with Enter or Space | ✅ | `activateFocusedButton()` → `onPlayAgain()` in GAME_OVER state. |
| A-07 | No keyboard trap; Shift+Tab reverses focus | ❌ | Tab is unconditionally intercepted by `e.preventDefault()` in `input.js:79`. Shift+Tab is not handled separately; the handler does not check `e.shiftKey`. Focus cannot be moved away from the canvas via keyboard. **See bug A-01.** |
| A-08 | Arrow/WASD keys do not trap page scroll | ⚠️ | Arrow key handlers do **not** call `e.preventDefault()` (`input.js:85–91`). Arrow keys affect the snake AND scroll the page simultaneously during gameplay. Scroll prevention would require `e.preventDefault()` inside the game handler. Minor UX issue only. |
| A-09 | P key pause toggle works from any focus position | ✅ | Bound to `document` keydown; fires regardless of which element has focus. |

### 3.2 Focus Indicators

| ID   | Checklist Item | Result | Notes |
|------|---------------|:------:|-------|
| A-23 | "Start Game" button shows visible focus ring | ✅ | 2 px white `strokeRect` drawn 3 px outside button bounds (`renderer.js:124–126`). |
| A-24 | "Resume" button shows visible focus ring | ✅ | Same `drawButton()` path. |
| A-25 | "Play Again" button shows visible focus ring | ✅ | Same. |
| A-26 | No `outline: none` without `:focus-visible` replacement | ✅ | `style.css` does not suppress `outline`. Canvas focus ring is custom-drawn; no CSS `outline` suppression present. |

---

## 4. Semantic Markup & ARIA

| ID   | Checklist Item | Result | Notes |
|------|---------------|:------:|-------|
| A-27 | Canvas has text alternative / `aria-label` | ✅ | `<canvas … aria-label="Snake 3 game area">` present in `index.html:13`. |
| A-28 | Buttons use `<button>` element | ❌ | All three buttons ("Start Game", "Resume", "Play Again") are **canvas-drawn rectangles**, not HTML `<button>` elements. There are no `<button>` elements in the DOM. Screen readers cannot discover these interactive elements. **See bug A-02.** |
| A-29 | Page has a descriptive `<title>` | ✅ | `<title>Snake 3</title>` present in `index.html:6`. |
| A-30 | Screen-reader announcement on Game Over | ❌ | No ARIA live region (`aria-live`) exists to announce game over, final score, or high score to assistive technology. The game state change is rendered only on canvas, which screen readers cannot read. **See bug A-03.** |

---

## 5. Accessibility Bug List

### Bug A-01 — Keyboard trap: Tab cannot move focus off canvas
**Severity: Major**
**Test ID:** A-07
**Location:** `src/input.js:78–81`
**Description:** The Tab keydown handler always calls `e.preventDefault()` and never moves focus away from the canvas. Users relying on keyboard navigation to reach other page elements (e.g., browser chrome, other focusable elements if added later) cannot do so with Tab. Shift+Tab is not handled; pressing it does nothing observable.
**WCAG criterion:** 2.1.2 No Keyboard Trap (Level A)
**Recommendation:** Check `e.shiftKey`; only intercept Tab when it should cycle within the canvas. Allow Shift+Tab to exit canvas focus. Alternatively, since each screen has only one button, allow Tab to wrap naturally without preventing default when no additional buttons are present.

---

### Bug A-02 — Buttons are canvas shapes, not semantic HTML buttons
**Severity: Major**
**Test ID:** A-28
**Location:** `index.html`, `src/renderer.js`
**Description:** "Start Game", "Resume", and "Play Again" are drawn as filled rectangles on the canvas via `drawButton()`. They are not `<button>` elements and are invisible to screen readers. A screen reader user navigating the page will find only the canvas element with `aria-label="Snake 3 game area"` and no discoverable interactive controls.
**WCAG criterion:** 4.1.2 Name, Role, Value (Level A)
**Recommendation:** Add visually-hidden `<button>` elements overlaid on the canvas (or outside it) that mirror the canvas buttons. These can be absolutely positioned and hidden visually using a `.sr-only` CSS class. The canvas-drawn buttons can remain for visual fidelity.

---

### Bug A-03 — No live region for Game Over announcement
**Severity: Minor**
**Test ID:** A-30
**Location:** `index.html`, `src/main.js`
**Description:** When the game enters Game Over state, no DOM change occurs that would alert a screen reader. The final score and high score are rendered only on the canvas. Screen reader users receive no notification that the game has ended.
**WCAG criterion:** 4.1.3 Status Messages (Level AA)
**Recommendation:** Add a visually-hidden `aria-live="polite"` region to the HTML. When `sm.gameOver()` is called in `main.js`, update the live region's text content with the final score and high score, e.g., `"Game over. Score: 120. High score: 150."`.

---

## 6. Summary

### WCAG AA Compliance Overview

| Category | Checks | Pass | Fail |
|----------|:------:|:----:|:----:|
| Colour Contrast (§1.4.3, §1.4.11) | 15 | 15 | 0 |
| Keyboard Navigation (§2.1) | 9 | 6 | 1 (A-07) + 1 warn (A-08) |
| Focus Indicators (§2.4.7) | 4 | 4 | 0 |
| Semantic Markup / ARIA (§4.1) | 4 | 2 | 2 (A-28, A-30) |

| Severity | Count | Bugs |
|----------|:-----:|------|
| Critical | 0 | — |
| Major    | 2 | A-01 (keyboard trap), A-02 (no semantic buttons) |
| Minor    | 1 | A-03 (no live region) |

**Colour contrast: fully compliant.** All 15 foreground/background pairs meet or exceed
WCAG AA requirements, with the narrowest margin being food vs. grid (4.20:1 against a
3:1 requirement).

**Keyboard navigation: partially compliant.** All buttons are reachable and activatable
via Tab + Enter/Space, and the visual focus ring is clearly visible. However, Tab creates
a keyboard trap (WCAG 2.1.2) and semantic button elements are absent (WCAG 4.1.2).

---

_End of Report_
