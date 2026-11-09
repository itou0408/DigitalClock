// Color Palettes
const LED_COLORS = {
  amber: { on: '#ffd54f', glow: 'rgba(255, 213, 79, 0.55)', off: '#20242a' },
  red:   { on: '#ff5252', glow: 'rgba(255, 82, 82, 0.55)',   off: '#251c1e' },
  green: { on: '#69f0ae', glow: 'rgba(105, 240, 174, 0.55)', off: '#1a2620' },
  cyan:  { on: '#40c4ff', glow: 'rgba(64, 196, 255, 0.55)',  off: '#1b242a' },
  white: { on: '#ffffff', glow: 'rgba(255, 255, 255, 0.55)', off: '#22252a' }
};

// Outer Border Colors Palette (matching photo: red, green, blue, amber, white)
const BORDER_BULB_COLORS = [
  '#ff453a', '#ff9f0a', '#ffd60a', '#32d74b', '#64d2ff', '#0a84ff', '#bf5af2', '#ffffff'
];

// DOM
const matrixCanvas = document.getElementById('matrixCanvas');
const borderCanvas = document.getElementById('borderLedsCanvas');
const msgInput = document.getElementById('msgInput');
const updateMsgBtn = document.getElementById('updateMsgBtn');
const clockModeBtn = document.getElementById('clockModeBtn');
const scrollModeBtn = document.getElementById('scrollModeBtn');
const colorSelect = document.getElementById('colorSelect');
const pillBtns = document.querySelectorAll('.pill-btn');

const ctx = matrixCanvas.getContext('2d');
const bCtx = borderCanvas.getContext('2d');

// State
let displayText = '餃子';
let isClockMode = false;
let isScrollMode = false;
let selectedColorKey = 'amber';
let scrollOffset = 0;
let borderStep = 0;

// Grid Resolution: 96 columns x 28 rows (Ultrawide Aspect)
const GRID_COLS = 96;
const GRID_ROWS = 28;
let dotGrid = [];

// Offscreen Canvas for text-to-bitmap rasterization
const offCanvas = document.createElement('canvas');
const offCtx = offCanvas.getContext('2d');

function rasterizeText(text) {
  const charCount = text.length;
  // If text is short (1-4 chars), center it and turn off auto scroll
  const isShort = charCount <= 3;
  if (!isClockMode && isShort && !isScrollMode) {
    scrollOffset = 0;
  }

  // Width needed for text
  const fontSize = 24;
  offCtx.font = `900 ${fontSize}px 'M PLUS 1p', sans-serif`;
  const textMetrics = offCtx.measureText(text);
  const textWidth = Math.ceil(textMetrics.width);
  const textHeight = 28;

  offCanvas.width = Math.max(textWidth + GRID_COLS * 2, GRID_COLS * 2);
  offCanvas.height = textHeight;

  // Clear
  offCtx.fillStyle = '#000000';
  offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);

  // Draw White Text on Black
  offCtx.fillStyle = '#ffffff';
  offCtx.font = `900 ${fontSize}px 'M PLUS 1p', sans-serif`;
  offCtx.textBaseline = 'middle';

  const startX = isShort && !isScrollMode ? Math.floor((GRID_COLS - textWidth) / 2) : 0;
  offCtx.fillText(text, startX, textHeight / 2);

  return {
    width: textWidth,
    imgData: offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height)
  };
}

let currentRaster = rasterizeText(displayText);

// Resize Canvases
function resize() {
  const rect = matrixCanvas.getBoundingClientRect();
  matrixCanvas.width = rect.width;
  matrixCanvas.height = rect.height;

  const bRect = borderCanvas.getBoundingClientRect();
  borderCanvas.width = bRect.width;
  borderCanvas.height = bRect.height;
}
window.addEventListener('resize', resize);

// Draw Outer Chaser LED Border
function drawBorderLeds() {
  const w = borderCanvas.width;
  const h = borderCanvas.height;
  bCtx.clearRect(0, 0, w, h);

  const bulbRadius = Math.max(3, Math.min(6, w * 0.007));
  const spacing = bulbRadius * 3.2;

  // Outer perimeter points
  const points = [];
  const pad = 10;

  // Top edge
  for (let x = pad; x < w - pad; x += spacing) points.push({ x, y: pad });
  // Right edge
  for (let y = pad; y < h - pad; y += spacing) points.push({ x: w - pad, y });
  // Bottom edge
  for (let x = w - pad; x > pad; x -= spacing) points.push({ x, y: h - pad });
  // Left edge
  for (let y = h - pad; y > pad; y -= spacing) points.push({ x: pad, y });

  // Draw bulbs with moving rainbow/chaser colors
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const colorIndex = (i + borderStep) % BORDER_BULB_COLORS.length;
    const color = BORDER_BULB_COLORS[colorIndex];

    bCtx.save();
    bCtx.beginPath();
    bCtx.arc(pt.x, pt.y, bulbRadius, 0, Math.PI * 2);
    bCtx.fillStyle = color;
    bCtx.shadowColor = color;
    bCtx.shadowBlur = bulbRadius * 1.5;
    bCtx.fill();
    bCtx.restore();
  }
}

// Draw Main Matrix Grid
function drawMatrix() {
  const w = matrixCanvas.width;
  const h = matrixCanvas.height;
  ctx.clearRect(0, 0, w, h);

  const cellW = w / GRID_COLS;
  const cellH = h / GRID_ROWS;
  const radius = Math.min(cellW, cellH) * 0.42;

  const pal = LED_COLORS[selectedColorKey] || LED_COLORS.amber;
  const imgData = currentRaster.imgData;
  const rasterW = offCanvas.width;
  const rasterH = offCanvas.height;

  // Text scroll offset in pixels
  const offset = Math.floor(scrollOffset);

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cx = (c + 0.5) * cellW;
      const cy = (r + 0.5) * cellH;

      // Sample raster pixel
      let isOn = false;
      const sampleX = c + offset;
      const sampleY = Math.floor(r * (rasterH / GRID_ROWS));

      if (sampleX >= 0 && sampleX < rasterW && sampleY >= 0 && sampleY < rasterH) {
        const idx = (sampleY * rasterW + sampleX) * 4;
        const brightness = imgData.data[idx]; // Red channel
        isOn = brightness > 90;
      }

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);

      if (isOn) {
        ctx.fillStyle = pal.on;
        ctx.shadowColor = pal.glow;
        ctx.shadowBlur = radius * 2;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      } else {
        ctx.fillStyle = pal.off;
        ctx.fill();
      }
    }
  }
}

// Animation Loop
let lastTime = 0;
function animate(time) {
  const dt = time - lastTime;
  lastTime = time;

  // Border LED step
  if (Math.floor(time / 140) !== Math.floor((time - dt) / 140)) {
    borderStep = (borderStep + 1) % BORDER_BULB_COLORS.length;
  }

  // Scroll or Clock updates
  if (isClockMode) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const clockStr = `${hh}:${mm}:${ss}`;
    if (displayText !== clockStr) {
      displayText = clockStr;
      currentRaster = rasterizeText(displayText);
    }
  } else if (isScrollMode) {
    scrollOffset += dt * 0.04; // scroll speed
    if (scrollOffset > currentRaster.width + GRID_COLS) {
      scrollOffset = -GRID_COLS;
    }
  }

  drawBorderLeds();
  drawMatrix();

  requestAnimationFrame(animate);
}

// Events
updateMsgBtn.addEventListener('click', () => {
  const val = msgInput.value.trim();
  if (val) {
    isClockMode = false;
    clockModeBtn.classList.remove('active');
    displayText = val;
    scrollOffset = 0;
    currentRaster = rasterizeText(displayText);
  }
});

msgInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    updateMsgBtn.click();
  }
});

clockModeBtn.addEventListener('click', () => {
  isClockMode = !isClockMode;
  clockModeBtn.classList.toggle('active', isClockMode);
  if (isClockMode) {
    isScrollMode = false;
    scrollModeBtn.classList.remove('active');
    scrollOffset = 0;
  } else {
    displayText = msgInput.value || '餃子';
    currentRaster = rasterizeText(displayText);
  }
});

scrollModeBtn.addEventListener('click', () => {
  isScrollMode = !isScrollMode;
  scrollModeBtn.classList.toggle('active', isScrollMode);
  if (isScrollMode) {
    isClockMode = false;
    clockModeBtn.classList.remove('active');
  } else {
    scrollOffset = 0;
  }
});

colorSelect.addEventListener('change', (e) => {
  selectedColorKey = e.target.value;
});

// Preset Pills click
pillBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    isClockMode = false;
    clockModeBtn.classList.remove('active');
    msgInput.value = btn.dataset.text;
    displayText = btn.dataset.text;
    scrollOffset = 0;
    currentRaster = rasterizeText(displayText);
  });
});

// Screen Wake Lock
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try { await navigator.wakeLock.request('screen'); } catch (e) {}
  }
}
document.addEventListener('click', requestWakeLock, { once: true });

// Init
resize();
animate(0);
