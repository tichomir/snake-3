/**
 * Scoring, speed-tier progression, and high-score persistence.
 *
 * Tier boundaries (based on total food eaten):
 *   Tier 1:  0–9  food → x1.0 multiplier → 10 pts per food
 *   Tier 2: 10–19 food → x1.5 multiplier → 15 pts per food
 *   Tier 3: 20+   food → x2.0 multiplier → 20 pts per food
 *
 * Speed increases every 5 food items eaten, starting at 150 ms/tick
 * and decreasing by 15 ms per step, floored at 60 ms.
 */

const BASE_TICK_MS = 150;
const TICK_STEP_MS = 15;
const MIN_TICK_MS  = 60;

export function getScoreMultiplier(foodEaten) {
  if (foodEaten >= 20) return 2.0;
  if (foodEaten >= 10) return 1.5;
  return 1.0;
}

/** Points awarded for eating the next food item (before foodEaten is incremented). */
export function getPointsForFood(foodEaten) {
  return Math.round(10 * getScoreMultiplier(foodEaten));
}

/** Current tick interval in ms, based on total food eaten so far. */
export function getTickMs(foodEaten) {
  const speedLevel = Math.floor(foodEaten / 5);
  return Math.max(MIN_TICK_MS, BASE_TICK_MS - speedLevel * TICK_STEP_MS);
}

export function loadHighScore() {
  if (typeof localStorage === 'undefined') return 0;
  try {
    const stored = localStorage.getItem('snakeHighScore');
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(score) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem('snakeHighScore', String(score));
  } catch {
    // Ignore — e.g. private browsing with storage blocked
  }
}
