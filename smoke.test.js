const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = __dirname;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
  } catch (err) {
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err.message}`);
    process.exitCode = 1;
  }
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('index.html exists', () => {
  assert.ok(fs.existsSync(path.join(root, 'index.html')), 'index.html not found');
});

test('index.html contains canvas element with id="game-canvas"', () => {
  assert.ok(html.includes('id="game-canvas"'), 'canvas#game-canvas not found in index.html');
});

test('index.html loads game module (src/main.js)', () => {
  assert.ok(html.includes('src="src/main.js"'), 'src/main.js module script not found in index.html');
});

test('style.css file exists', () => {
  assert.ok(fs.existsSync(path.join(root, 'style.css')), 'style.css not found');
});

test('src/main.js is referenced in index.html', () => {
  assert.ok(html.includes('src="src/main.js"'), 'src/main.js script tag not found in index.html');
});

test('main.js file exists', () => {
  assert.ok(fs.existsSync(path.join(root, 'main.js')), 'main.js not found');
});
