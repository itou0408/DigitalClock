// DOM Elements
const hourHand = document.getElementById('hourHand');
const minuteHand = document.getElementById('minuteHand');
const secondHand = document.getElementById('secondHand');
const clockTicks = document.getElementById('clockTicks');
const calMonthTitle = document.getElementById('calMonthTitle');
const calDaysGrid = document.getElementById('calDaysGrid');
const themeToggleBtn = document.getElementById('themeToggleBtn');

// Build Minute/Second Ticks around dial
function createDialTicks() {
  for (let i = 0; i < 60; i++) {
    const tick = document.createElement('div');
    const isHour = i % 5 === 0;
    tick.style.position = 'absolute';
    tick.style.top = '6px';
    tick.style.left = '50%';
    tick.style.width = isHour ? '2.5px' : '1px';
    tick.style.height = isHour ? '8px' : '4px';
    tick.style.marginLeft = isHour ? '-1.25px' : '-0.5px';
    tick.style.background = isHour ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)';
    tick.style.transformOrigin = '50% 164px'; // for ~340px clock radius
    tick.style.transform = `rotate(${i * 6}deg)`;
    clockTicks.appendChild(tick);
  }
}

// Update Clock Hands smoothly
function updateClock() {
  const now = new Date();
  const ms = now.getMilliseconds();
  const sec = now.getSeconds() + ms / 1000;
  const min = now.getMinutes() + sec / 60;
  const hr = (now.getHours() % 12) + min / 60;

  const secDeg = sec * 6; // 360 / 60
  const minDeg = min * 6; // 360 / 60
  const hrDeg = hr * 30;  // 360 / 12

  secondHand.style.transform = `rotate(${secDeg}deg)`;
  minuteHand.style.transform = `rotate(${minDeg}deg)`;
  hourHand.style.transform = `rotate(${hrDeg}deg)`;

  requestAnimationFrame(updateClock);
}

// Render Monthly Calendar
function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const todayDate = now.getDate();

  // Set Title (e.g. "11月")
  calMonthTitle.textContent = `${month + 1}月`;

  // First day of month (0: Sun, 1: Mon, ...)
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Total days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();

  calDaysGrid.innerHTML = '';

  // Blank slots before 1st of month
  for (let i = 0; i < firstDayIndex; i++) {
    const emptySlot = document.createElement('div');
    emptySlot.className = 'cal-day empty';
    calDaysGrid.appendChild(emptySlot);
  }

  // Days of the month
  for (let d = 1; d <= totalDays; d++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'cal-day';
    dayEl.textContent = d;

    if (d === todayDate) {
      dayEl.classList.add('today');
    }
    calDaysGrid.appendChild(dayEl);
  }
}

// Theme Toggle (Default Black vs iOS Night Mode Red)
let isRedTheme = localStorage.getItem('standby_theme') === 'red';
function applyTheme(red) {
  isRedTheme = red;
  document.body.classList.toggle('theme-red', isRedTheme);
  themeToggleBtn.textContent = isRedTheme ? '☀️ 通常モード' : '🌙 ナイトモード';
  localStorage.setItem('standby_theme', isRedTheme ? 'red' : 'default');
}

themeToggleBtn.addEventListener('click', () => {
  applyTheme(!isRedTheme);
});

// Screen Wake Lock
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      await navigator.wakeLock.request('screen');
    } catch (e) {
      console.warn('Wake Lock error:', e);
    }
  }
}
document.addEventListener('click', requestWakeLock, { once: true });

// Initialize
createDialTicks();
applyTheme(isRedTheme);
renderCalendar();
updateClock();
// Re-render calendar at midnight
setInterval(renderCalendar, 60000);
