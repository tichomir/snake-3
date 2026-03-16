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

test("index.html contains <h1>Hello, World!</h1>", () => {
  assert.ok(html.includes('<h1>Hello, World!</h1>'), 'H1 text not found in index.html');
});

test('style.css is linked in index.html', () => {
  assert.ok(html.includes('href="style.css"'), 'style.css link not found in index.html');
});

test('style.css file exists', () => {
  assert.ok(fs.existsSync(path.join(root, 'style.css')), 'style.css not found');
});

test('main.js is referenced in index.html', () => {
  assert.ok(html.includes('src="main.js"'), 'main.js script tag not found in index.html');
});

test('main.js file exists', () => {
  assert.ok(fs.existsSync(path.join(root, 'main.js')), 'main.js not found');
});
