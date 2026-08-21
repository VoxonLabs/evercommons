const canvas = document.querySelector("#commons-canvas");
const ctx = canvas.getContext("2d");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const palette = ["#1f7a5b", "#2166a5", "#b87014", "#b74336"];
let width = 0;
let height = 0;
let points = [];
let rafId = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  seedPoints();
}

function seedPoints() {
  const count = Math.max(34, Math.min(92, Math.floor((width * height) / 18000)));
  points = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.34,
    vy: (Math.random() - 0.5) * 0.34,
    color: palette[index % palette.length],
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  ctx.globalAlpha = 0.42;

  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    if (!prefersReducedMotion.matches) {
      point.x += point.vx;
      point.y += point.vy;
    }

    if (point.x < -20) point.x = width + 20;
    if (point.x > width + 20) point.x = -20;
    if (point.y < -20) point.y = height + 20;
    if (point.y > height + 20) point.y = -20;

    ctx.beginPath();
    ctx.fillStyle = point.color;
    ctx.arc(point.x, point.y, 2.6, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < points.length; j += 1) {
      const other = points[j];
      const dx = point.x - other.x;
      const dy = point.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 150) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(20, 33, 31, ${0.12 * (1 - distance / 150)})`;
        ctx.lineWidth = 1;
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }
  }

  ctx.globalAlpha = 1;
  rafId = window.requestAnimationFrame(draw);
}

window.addEventListener("resize", resizeCanvas, { passive: true });

resizeCanvas();
draw();

const restartAnimation = () => {
  window.cancelAnimationFrame(rafId);
  draw();
};

if (typeof prefersReducedMotion.addEventListener === "function") {
  prefersReducedMotion.addEventListener("change", restartAnimation);
} else if (typeof prefersReducedMotion.addListener === "function") {
  prefersReducedMotion.addListener(restartAnimation);
}
