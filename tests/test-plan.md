# Test Plan — The Snake (Vanilla JS Canvas Game)

_Version: 1.0 | Created: 2026-03-16 | Phase: Testing & Release_

---

## 1. Target Browsers

| Browser | Version 1 (latest) | Version 2 (previous) |
|---------|--------------------|-----------------------|
| Chrome  | 133                | 132                   |
| Firefox | 135                | 134                   |
| Safari  | 18.3               | 18.2                  |
| Edge    | 133                | 132                   |

All tests must pass on all eight browser/version combinations above.

---

## 2. Functional Test Cases

Each test case must be executed manually in every target browser unless marked **automated**.

### 2.1 Game Start

| ID    | Test Case                                              | Expected Result                                                      |
|-------|--------------------------------------------------------|----------------------------------------------------------------------|
| F-01  | Open `index.html` directly in browser (file:// or served) | Start screen renders: title, high score, and "Start Game" button visible |
| F-02  | Click "Start Game" button                              | Transitions to Playing state; canvas shows grid, snake (length 3), and food cell |
| F-03  | Press Enter / Space on Start screen                   | Same transition as F-02                                              |
| F-04  | Verify snake spawns at grid centre facing right        | Snake head at column 10, row 10 (0-indexed); 3 segments visible      |
| F-05  | High score shows 0 on first load (no localStorage)    | Score display reads "HI: 0"                                          |
| F-06  | High score loaded from localStorage on subsequent load | Correct persisted value displayed on Start screen                    |

### 2.2 Movement & Direction Control

| ID    | Test Case                                              | Expected Result                                                      |
|-------|--------------------------------------------------------|----------------------------------------------------------------------|
| F-07  | Press Arrow Right during play                          | Snake moves right continuously                                       |
| F-08  | Press Arrow Left during play                           | Snake turns left (unless currently moving right — reverse prevented) |
| F-09  | Press Arrow Up during play                             | Snake turns upward                                                   |
| F-10  | Press Arrow Down during play                           | Snake turns downward                                                 |
| F-11  | Press W / A / S / D during play                       | Same results as Arrow keys (F-07 to F-10)                            |
| F-12  | Press opposite direction key (reverse-prevention)     | Direction does not reverse; snake continues on current heading        |
| F-13  | Rapid direction change (two keys in quick succession) | Only valid direction changes are accepted; no reverse allowed        |

### 2.3 Collision Detection

| ID    | Test Case                                              | Expected Result                                                      |
|-------|--------------------------------------------------------|----------------------------------------------------------------------|
| F-14  | Snake head reaches left wall                           | Game-Over state triggered immediately                                |
| F-15  | Snake head reaches right wall                         | Game-Over state triggered immediately                                |
| F-16  | Snake head reaches top wall                            | Game-Over state triggered immediately                                |
| F-17  | Snake head reaches bottom wall                        | Game-Over state triggered immediately                                |
| F-18  | Snake head collides with its own body                 | Game-Over state triggered immediately                                |
| F-19  | Snake head occupies same cell as food                 | Food eaten: snake grows by 1, new food spawns on unoccupied cell, score increments |

### 2.4 Scoring & Speed Progression

| ID    | Test Case                                              | Expected Result                                                      |
|-------|--------------------------------------------------------|----------------------------------------------------------------------|
| F-20  | Eat first food item                                   | Score increases by 10 (tier 1, ×1.0 multiplier)                     |
| F-21  | Eat 5th food item                                     | Speed increases to tier 2; subsequent food worth 15 pts (×1.5 multiplier) |
| F-22  | Eat 10th food item                                    | Speed increases to tier 3; subsequent food worth 20 pts (×2.0 multiplier) |
| F-23  | Score display updates on canvas after each food eaten | Live score reflected in HUD during play                              |
| F-24  | New high score is saved to localStorage on Game Over  | Subsequent page load shows new high score on Start screen            |
| F-25  | High score not overwritten if current score is lower  | Existing high score preserved                                        |

### 2.5 Pause

| ID    | Test Case                                              | Expected Result                                                      |
|-------|--------------------------------------------------------|----------------------------------------------------------------------|
| F-26  | Press P key during play                               | Paused overlay appears; game loop suspended                          |
| F-27  | Press P key again while paused                        | Game resumes from exact state; overlay disappears                    |
| F-28  | Click "Resume" button on paused overlay               | Same as F-27                                                         |
| F-29  | Snake does not move while paused                      | No state changes occur in game world during pause                    |
| F-30  | Score does not change while paused                    | Score value unchanged during pause                                   |

### 2.6 Game Over

| ID    | Test Case                                              | Expected Result                                                      |
|-------|--------------------------------------------------------|----------------------------------------------------------------------|
| F-31  | Game-Over screen displays final score                 | Correct score shown                                                  |
| F-32  | Game-Over screen displays high score                  | Correct (updated if new record) high score shown                     |
| F-33  | New high-score congratulatory message shown           | Message appears only when final score exceeds previous high score    |
| F-34  | No congratulatory message when score is not a new high | Message absent                                                      |
| F-35  | Click "Play Again" button                             | Game resets to Playing state without page reload; snake, score, and food reinitialised |
| F-36  | State machine transitions: Start → Playing → Game Over → Playing | Full cycle completes correctly                              |

### 2.7 Responsive Scaling

| ID    | Test Case                                              | Expected Result                                                      |
|-------|--------------------------------------------------------|----------------------------------------------------------------------|
| F-37  | Resize browser window to 360px wide                   | Canvas scales down to fit; no overflow or clipping                   |
| F-38  | Resize browser window to 1920px wide                  | Canvas scales up; grid fills available space proportionally          |
| F-39  | Resize window during active gameplay                  | Canvas rescales without interrupting game state                      |
| F-40  | DevTools mobile emulation (e.g., iPhone SE 375px)     | Layout is usable; canvas visible without horizontal scroll           |

### 2.8 Touch Gestures (Mobile / Touch Devices)

| ID    | Test Case                                              | Expected Result                                                      |
|-------|--------------------------------------------------------|----------------------------------------------------------------------|
| F-41  | Swipe right on canvas                                 | Snake direction changes to right                                     |
| F-42  | Swipe left on canvas                                  | Snake direction changes to left                                      |
| F-43  | Swipe up on canvas                                    | Snake direction changes to up                                        |
| F-44  | Swipe down on canvas                                  | Snake direction changes to down                                      |
| F-45  | Reverse-direction swipe (e.g., swipe left while moving right) | Direction does not reverse; guard applied same as keyboard |
| F-46  | Tap "Start Game" / "Resume" / "Play Again" buttons on touch | Buttons respond correctly to tap events                         |

---

## 3. WCAG AA Accessibility Checklist

### 3.1 Keyboard Navigation

| ID    | Checklist Item                                                  | Pass Criteria                                             |
|-------|-----------------------------------------------------------------|-----------------------------------------------------------|
| A-01  | "Start Game" button reachable by Tab key from page load         | Receives visible focus within 1–2 Tab presses             |
| A-02  | "Start Game" button activatable with Enter or Space             | Game transitions to Playing state                         |
| A-03  | "Resume" button on Pause overlay reachable by Tab               | Receives visible focus                                    |
| A-04  | "Resume" button activatable with Enter or Space                 | Game resumes                                             |
| A-05  | "Play Again" button on Game Over screen reachable by Tab        | Receives visible focus                                    |
| A-06  | "Play Again" button activatable with Enter or Space             | Game resets                                               |
| A-07  | No keyboard trap: Tab cycles through all focusable elements     | Focus never becomes stuck; Shift+Tab reverses focus order |
| A-08  | Arrow key / WASD game controls do not interfere with page scroll | Page scroll blocked only while canvas has focus, or scroll is prevented without trapping focus |
| A-09  | P key pause toggle works from any focus position during play    | Pause activates regardless of which element has focus    |

### 3.2 Colour Contrast

Minimum ratios per WCAG AA: **4.5:1** for normal text (< 18pt / < 14pt bold), **3:1** for large text and non-text UI components.

| ID    | UI Element                              | Foreground  | Background  | Required Ratio | Must Meet      |
|-------|-----------------------------------------|-------------|-------------|----------------|----------------|
| A-10  | Score text on canvas during play        | Measure     | Measure     | 4.5:1          | Normal text    |
| A-11  | High score text on canvas during play   | Measure     | Measure     | 4.5:1          | Normal text    |
| A-12  | "Start Game" button label               | Measure     | Measure     | 4.5:1          | Normal text    |
| A-13  | Title text on Start screen              | Measure     | Measure     | 3:1            | Large text     |
| A-14  | High score label on Start screen        | Measure     | Measure     | 4.5:1          | Normal text    |
| A-15  | "Resume" button label on Pause overlay  | Measure     | Measure     | 4.5:1          | Normal text    |
| A-16  | "PAUSED" heading on overlay             | Measure     | Measure     | 3:1            | Large text     |
| A-17  | Final score text on Game Over screen    | Measure     | Measure     | 4.5:1          | Normal text    |
| A-18  | "Play Again" button label               | Measure     | Measure     | 4.5:1          | Normal text    |
| A-19  | Congratulatory message text             | Measure     | Measure     | 4.5:1          | Normal text    |
| A-20  | Snake body segments vs. grid background | Measure     | Measure     | 3:1            | Non-text UI    |
| A-21  | Snake head vs. grid background          | Measure     | Measure     | 3:1            | Non-text UI    |
| A-22  | Food cell vs. grid background           | Measure     | Measure     | 3:1            | Non-text UI    |

_Measure actual colours from `src/renderer.js` and `src/constants.js` using a contrast checker (e.g., [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)) and record results in the accessibility audit report._

### 3.3 Focus Indicators

| ID    | Checklist Item                                            | Pass Criteria                                      |
|-------|-----------------------------------------------------------|----------------------------------------------------|
| A-23  | "Start Game" button shows visible focus ring              | Browser default or custom outline ≥ 2px, visible against background |
| A-24  | "Resume" button shows visible focus ring                  | Same as A-23                                      |
| A-25  | "Play Again" button shows visible focus ring              | Same as A-23                                      |
| A-26  | Focus indicator not suppressed by `outline: none` without replacement | CSS audit confirms no `outline: 0` without `:focus-visible` alternative |

### 3.4 Semantic Markup & ARIA

| ID    | Checklist Item                                            | Pass Criteria                                      |
|-------|-----------------------------------------------------------|----------------------------------------------------|
| A-27  | Canvas element has a text alternative / `aria-label`      | `<canvas aria-label="Snake game canvas">` or equivalent |
| A-28  | Buttons use `<button>` element (not `<div>` or `<span>`)  | Confirmed in `index.html`                         |
| A-29  | Page has a `<title>` element                              | `<title>` present and descriptive                 |
| A-30  | Screen-reader announcement on Game Over (score)           | Live region or focus shift communicates result to assistive technology |

---

## 4. Performance Regression Checklist

### 4.1 Frame Rate (60 fps Target)

| ID    | Check                                                       | Threshold        | Tool / Method                              |
|-------|-------------------------------------------------------------|------------------|--------------------------------------------|
| P-01  | Steady-state FPS during normal gameplay (snake length ≤ 10) | ≥ 60 fps median  | Chrome DevTools Performance panel / `window.__fpsStats` |
| P-02  | FPS during rapid direction changes                          | ≥ 60 fps median  | Same as P-01                               |
| P-03  | FPS at maximum snake length (near-full grid)                | ≥ 55 fps (soft)  | Same as P-01                               |
| P-04  | FPS on resize event (debounced)                             | No dropped frames > 100ms | Performance panel — mark resize events |
| P-05  | FPS in Firefox (latest)                                     | ≥ 60 fps median  | Firefox DevTools Performance                |
| P-06  | FPS in Safari (latest)                                      | ≥ 60 fps median  | Safari Web Inspector Timelines              |
| P-07  | FPS in Edge (latest)                                        | ≥ 60 fps median  | Edge DevTools Performance panel             |
| P-08  | No frame time spikes > 16.7 ms sustained > 3 consecutive frames | Pass/Fail    | DevTools frame timeline                     |

### 4.2 Initial Load Time

| ID    | Check                                                       | Threshold        | Tool / Method                              |
|-------|-------------------------------------------------------------|------------------|--------------------------------------------|
| P-09  | Time to first meaningful paint (canvas visible)             | < 1 000 ms       | Chrome DevTools Lighthouse / Network panel |
| P-10  | Total page load time (all resources)                        | < 1 000 ms       | `window.performance.timing` or Lighthouse  |
| P-11  | No render-blocking resources identified                     | Pass/Fail        | Lighthouse "Eliminate render-blocking resources" |
| P-12  | Total transfer size of all page assets                      | < 100 KB         | DevTools Network tab (disable cache)       |
| P-13  | Load time on throttled connection (Fast 3G simulation)      | < 3 000 ms       | Chrome DevTools Network throttling         |

### 4.3 Memory & CPU

| ID    | Check                                                       | Threshold        | Tool / Method                              |
|-------|-------------------------------------------------------------|------------------|--------------------------------------------|
| P-14  | JS heap size after 5 minutes of continuous gameplay         | < 50 MB          | Chrome DevTools Memory → Heap snapshot     |
| P-15  | No memory leak: heap stable across 3 play sessions          | Heap growth < 5% | Compare heap snapshots between sessions    |
| P-16  | CPU usage during gameplay (desktop, no throttle)            | < 10% single-core| Chrome Task Manager / Activity Monitor     |

---

## 5. Test Execution Notes

### Environment Setup
1. Serve the project with a local HTTP server (e.g., `npx serve .`) — do not use `file://` for browser security reasons.
2. Clear localStorage before each full test run: `localStorage.clear()` in DevTools console.
3. Use an incognito / private window to avoid extension interference.
4. Record browser version from `navigator.userAgent` or the browser's About page.

### Pass / Fail Recording
- Record results in a separate **test-results.md** file (one per tester / run).
- Mark each test ID as **PASS**, **FAIL**, or **SKIP** (with reason).
- For failures, include: browser + version, steps to reproduce, observed vs. expected behaviour, and severity (Critical / High / Medium / Low).

### Severity Classification
| Severity | Definition |
|----------|------------|
| Critical | Game unplayable; crash, blank screen, data loss |
| High     | Core mechanic broken (collision, scoring, state transition) |
| Medium   | Visual defect or non-critical flow broken |
| Low      | Cosmetic issue; workaround exists |

---

## 6. Automated Tests Reference

The following automated tests already exist and must continue passing throughout this phase:

| File                         | Script                  | Coverage                        |
|------------------------------|-------------------------|---------------------------------|
| `tests/game.test.mjs`        | `npm run test:game`     | Grid, movement, collision, food |
| `tests/scoring.test.mjs`     | `npm run test:scoring`  | Score calc, speed-tier edges    |
| `tests/stateMachine.test.mjs`| `node tests/stateMachine.test.mjs` | State transitions   |
| `smoke.test.js`              | `npm test`              | Page load smoke test            |

Run `npm test && npm run test:game && npm run test:scoring` before each manual test session to confirm baseline.

---

_End of Test Plan_
