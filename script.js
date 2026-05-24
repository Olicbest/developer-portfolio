const canvas = document.querySelector("#ambientCanvas");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let width = 0;
let height = 0;
let ratio = 1;
let pointerX = 0.5;
let pointerY = 0.5;

const particles = Array.from({ length: 90 }, (_, index) => ({
  x: (index * 83) % 100,
  y: (index * 47) % 100,
  size: 0.8 + (index % 4) * 0.35,
  speed: 0.18 + (index % 7) * 0.035,
  hue: index % 3,
}));

function resizeCanvas() {
  ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawAmbient(time = 0) {
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createRadialGradient(
    width * pointerX,
    height * pointerY,
    0,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.9,
  );
  gradient.addColorStop(0, "rgba(141, 255, 189, 0.16)");
  gradient.addColorStop(0.34, "rgba(255, 123, 104, 0.07)");
  gradient.addColorStop(0.7, "rgba(119, 183, 255, 0.05)");
  gradient.addColorStop(1, "rgba(10, 11, 13, 0.98)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (!reduceMotion) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    particles.forEach((particle) => {
      const drift = time * 0.001 * particle.speed;
      const x = ((particle.x / 100) * width + Math.cos(drift + particle.y) * 38 + (pointerX - 0.5) * 42) % width;
      const y = ((particle.y / 100) * height + Math.sin(drift + particle.x) * 34 + (pointerY - 0.5) * 42) % height;
      ctx.beginPath();
      ctx.arc(x < 0 ? x + width : x, y < 0 ? y + height : y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle =
        particle.hue === 0
          ? "rgba(141, 255, 189, 0.48)"
          : particle.hue === 1
            ? "rgba(255, 209, 102, 0.38)"
            : "rgba(119, 183, 255, 0.32)";
      ctx.fill();
    });
    ctx.restore();
  }

  requestAnimationFrame(drawAmbient);
}

function observeReveals() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 },
  );

  document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 45, 280)}ms`;
    observer.observe(element);
  });
}

function duplicateMarquee() {
  const track = document.querySelector(".marquee div");
  if (!track) return;
  track.innerHTML += track.innerHTML;
}

function setupMotionControls() {
  const buttons = document.querySelectorAll("[data-motion-mode]");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      document.body.dataset.motion = button.dataset.motionMode;
      buttons.forEach((item) => item.classList.toggle("is-active", item === button));
    });
  });
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", (event) => {
  pointerX = event.clientX / window.innerWidth;
  pointerY = event.clientY / window.innerHeight;
});

resizeCanvas();
duplicateMarquee();
observeReveals();
setupMotionControls();
requestAnimationFrame(drawAmbient);
