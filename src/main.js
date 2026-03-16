const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

window.__frameCount = 0;
let lastTime = 0;

function update(delta) {
  // Game state update logic goes here
  // delta: milliseconds since last frame
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Drawing logic goes here
}

function loop(timestamp) {
  window.__frameCount++;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  update(delta);
  render();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
