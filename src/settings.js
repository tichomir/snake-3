// ---------------------------------------------------------------------------
// settings.js — in-game color settings panel
// ---------------------------------------------------------------------------

import { getConfig, applyConfig, getDefaults } from './config.js';

// Human-readable labels for each color key.
// Keys with non-hex values (e.g. rgba) are excluded from the picker.
const COLOR_KEYS = [
  { key: 'background',  label: 'Background'    },
  { key: 'gridLight',   label: 'Grid (Light)'  },
  { key: 'gridDark',    label: 'Grid (Dark)'   },
  { key: 'snake',       label: 'Snake Body'    },
  { key: 'snakeHead',   label: 'Snake Head'    },
  { key: 'snakeEye',    label: 'Snake Eye'     },
  { key: 'food',        label: 'Food'          },
  { key: 'text',        label: 'Text'          },
  { key: 'button',      label: 'Button'        },
  { key: 'buttonText',  label: 'Button Text'   },
  { key: 'buttonFocus', label: 'Button (Focus)'},
];

let _overlay = null;
let _returnFocus = null;
let _onClose = null;

// ---------------------------------------------------------------------------
// Build panel DOM (once)
// ---------------------------------------------------------------------------

function _build() {
  const overlay = document.createElement('div');
  overlay.id = 'settings-overlay';
  overlay.setAttribute('hidden', '');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'settings-title');

  const panel = document.createElement('div');
  panel.id = 'settings-panel';

  // Header
  const header = document.createElement('div');
  header.className = 'settings-header';

  const title = document.createElement('h2');
  title.id = 'settings-title';
  title.textContent = 'Color Settings';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'settings-close';
  closeBtn.setAttribute('aria-label', 'Close settings');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', closeSettings);

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Color rows
  const colorsDiv = document.createElement('div');
  colorsDiv.id = 'settings-colors';

  for (const { key, label } of COLOR_KEYS) {
    const row = document.createElement('div');
    row.className = 'settings-row';

    const lbl = document.createElement('label');
    lbl.setAttribute('for', `clr-${key}`);
    lbl.textContent = label;

    const input = document.createElement('input');
    input.type = 'color';
    input.id = `clr-${key}`;
    input.dataset.key = key;
    input.addEventListener('input', (e) => {
      applyConfig({ [key]: e.target.value });
    });

    row.appendChild(lbl);
    row.appendChild(input);
    colorsDiv.appendChild(row);
  }

  // Footer
  const footer = document.createElement('div');
  footer.className = 'settings-footer';

  const resetBtn = document.createElement('button');
  resetBtn.id = 'settings-reset';
  resetBtn.textContent = 'Reset to Defaults';
  resetBtn.addEventListener('click', () => {
    applyConfig(getDefaults());
    _refreshInputs();
  });

  footer.appendChild(resetBtn);

  panel.appendChild(header);
  panel.appendChild(colorsDiv);
  panel.appendChild(footer);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // Close on backdrop click (outside the panel)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSettings();
  });

  // Trap focus and handle Escape inside the dialog
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeSettings();
      return;
    }
    if (e.key === 'Tab') {
      _trapFocus(e, panel);
    }
  });

  return overlay;
}

function _trapFocus(e, container) {
  const focusable = Array.from(
    container.querySelectorAll('button, input[type="color"]')
  ).filter(el => !el.disabled);

  if (focusable.length === 0) return;
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

function _refreshInputs() {
  const cfg = getConfig();
  for (const { key } of COLOR_KEYS) {
    const input = document.getElementById(`clr-${key}`);
    if (input) input.value = cfg[key];
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Open the settings panel.
 * @param {function} [onClose]  Optional callback invoked when the panel closes.
 */
export function openSettings(onClose) {
  if (!_overlay) _overlay = _build();
  _onClose = onClose || null;
  _returnFocus = document.activeElement;
  _refreshInputs();
  _overlay.removeAttribute('hidden');
  // Focus the close button first so keyboard users have an obvious exit
  const closeBtn = _overlay.querySelector('.settings-close');
  if (closeBtn) closeBtn.focus();
}

/**
 * Close the settings panel and restore focus.
 */
export function closeSettings() {
  if (!_overlay) return;
  _overlay.setAttribute('hidden', '');
  if (_returnFocus && typeof _returnFocus.focus === 'function') {
    _returnFocus.focus();
  }
  if (_onClose) {
    const cb = _onClose;
    _onClose = null;
    cb();
  }
}
