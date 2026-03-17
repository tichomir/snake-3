// ---------------------------------------------------------------------------
// config.js — runtime color theme configuration
// ---------------------------------------------------------------------------
// Default values match the original hardcoded COLORS so the game looks
// identical with no overrides applied.
// ---------------------------------------------------------------------------

const _LS_KEY = 'snake3_colors';

const _defaults = {
  background:  '#1a1a2e',
  gridLight:   '#1e1e38',
  gridDark:    '#161628',
  snake:       '#4ecca3',
  snakeHead:   '#f5a623',
  snakeEye:    '#0a0a1a',
  food:        '#e94560',
  text:        '#ffffff',
  overlay:     'rgba(0,0,0,0.75)',
  button:      '#4ecca3',
  buttonText:  '#0a0a1a',
  buttonFocus: '#f5a623',
};

// Active config — starts as a shallow copy of defaults, then restores from localStorage
let _active = Object.assign({}, _defaults);

(function _restoreFromStorage() {
  try {
    const saved = localStorage.getItem(_LS_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === 'object') {
      for (const key of Object.keys(_defaults)) {
        if (Object.prototype.hasOwnProperty.call(parsed, key)) {
          _active[key] = parsed[key];
        }
      }
    }
  } catch (_) {
    // localStorage unavailable or JSON malformed — use defaults
  }
})();

/**
 * Returns the current active configuration object.
 * Renderer code should call this each frame so overrides are picked up
 * without requiring a page reload.
 * @returns {object}
 */
export function getConfig() {
  return _active;
}

/**
 * Returns a shallow copy of the default configuration.
 * @returns {object}
 */
export function getDefaults() {
  return Object.assign({}, _defaults);
}

/**
 * Deep-merges the supplied overrides into the active config and persists
 * to localStorage.
 * Only keys present in the defaults schema are accepted; unknown keys
 * are silently ignored to prevent typos from breaking the renderer.
 * @param {object} overrides
 */
export function applyConfig(overrides) {
  if (!overrides || typeof overrides !== 'object') return;
  const next = Object.assign({}, _active);
  for (const key of Object.keys(_defaults)) {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      next[key] = overrides[key];
    }
  }
  _active = next;
  try {
    localStorage.setItem(_LS_KEY, JSON.stringify(_active));
  } catch (_) {
    // localStorage unavailable — continue without persistence
  }
}
