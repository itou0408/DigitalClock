// State & Configuration
const state = {
  is24Hour: true,
  theme: localStorage.getItem('clock_theme') || 'theme-green',
  brightness: parseInt(localStorage.getItem('clock_brightness') || '100', 10),
  wakeLockEnabled: localStorage.getItem('clock_wakelock') !== 'false',
  gpsWeatherEnabled: localStorage.getItem('clock_gps_weather') !== 'false', // Default ON
  selectedCity: localStorage.getItem('clock_city') || 'gps',
  temp: parseFloat(localStorage.getItem('clock_temp') || '26.6'),
  humidity: parseInt(localStorage.getItem('clock_humidity') || '44', 10),
  tempUnit: '℃',
  locationName: localStorage.getItem('clock_loc_name') || '取得中...',
  lastUpdatedTime: null
};

// Major JMA AMeDAS Weather Stations across Japan
const JMA_STATIONS = {
  sapporo: { id: '14163', name: '札幌', lat: 43.060, lon: 141.328 },
  sendai:  { id: '34392', name: '仙台', lat: 38.262, lon: 140.897 },
  tokyo:   { id: '44132', name: '東京', lat: 35.692, lon: 139.753 },
  yokohama:{ id: '46106', name: '横浜', lat: 35.438, lon: 139.654 },
  nagoya:  { id: '51106', name: '名古屋', lat: 35.167, lon: 136.965 },
  kyoto:   { id: '61286', name: '京都', lat: 35.013, lon: 135.733 },
  osaka:   { id: '62078', name: '大阪', lat: 34.682, lon: 135.518 },
  hiroshima:{ id: '67437', name: '広島', lat: 34.398, lon: 132.463 },
  fukuoka: { id: '82182', name: '福岡', lat: 33.582, lon: 130.376 },
  naha:    { id: '91197', name: '那覇', lat: 26.207, lon: 127.687 }
};

let wakeLock = null;

// DOM Elements
const timeDigitsEl = document.getElementById('timeDigits');
const secDigitsEl = document.getElementById('secDigits');
const tempValEl = document.getElementById('tempVal');
const humValEl = document.getElementById('humVal');
const dateValEl = document.getElementById('dateVal');
const dayKanjiEl = document.getElementById('dayKanji');
const rokuyoValEl = document.getElementById('rokuyoVal');
const clockFrameEl = document.getElementById('clockFrame');
const locTextEl = document.getElementById('locText');
const radioSignalEl = document.getElementById('radioSignal');

// Settings Elements
const settingsModalEl = document.getElementById('settingsModal');
const settingsToggleBtn = document.getElementById('settingsToggleBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const brightnessSlider = document.getElementById('brightnessSlider');
const wakeLockSwitch = document.getElementById('wakeLockSwitch');
const gpsWeatherSwitch = document.getElementById('gpsWeatherSwitch');
const citySelect = document.getElementById('citySelect');
const manualTempSlider = document.getElementById('manualTempSlider');
const manualTempLabel = document.getElementById('manualTempLabel');
const manualHumSlider = document.getElementById('manualHumSlider');
const manualHumLabel = document.getElementById('manualHumLabel');
const btn24h = document.getElementById('btn24h');
const btn12h = document.getElementById('btn12h');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const themeBtns = document.querySelectorAll('.theme-btn');

// Days of week (Japanese Kanji)
const DAYS_KANJI = ['日', '月', '火', '水', '木', '金', '土'];

// Rokuyo calculation helper
const ROKUYO_NAMES = ['大安', '赤口', '先勝', '友引', '先負', '仏滅'];
function calculateRokuyo(date) {
  const base = new Date(2026, 0, 1);
  const diffDays = Math.floor((date - base) / (1000 * 60 * 60 * 24));
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const index = (month + day + diffDays) % 6;
  return ROKUYO_NAMES[Math.abs(index)];
}

// Update Clock Display
function updateClock() {
  const now = new Date();
  
  // Hours & Minutes
  let hours = now.getHours();
  if (!state.is24Hour) {
    hours = hours % 12 || 12;
  }
  const hoursStr = String(hours).padStart(2, '0');
  const minStr = String(now.getMinutes()).padStart(2, '0');
  const secStr = String(now.getSeconds()).padStart(2, '0');

  // Time HTML with blinking colon
  timeDigitsEl.innerHTML = `${hoursStr}<span class="blink-colon">:</span>${minStr}`;
  secDigitsEl.textContent = secStr;

  // Date (M/D) & Day
  const month = now.getMonth() + 1;
  const day = now.getDate();
  dateValEl.textContent = `${month}/${day}`;
  dayKanjiEl.textContent = DAYS_KANJI[now.getDay()];

  // Saturday / Sunday special colors
  if (now.getDay() === 0) {
    dayKanjiEl.style.color = '#ff6b6b';
  } else if (now.getDay() === 6) {
    dayKanjiEl.style.color = '#54a0ff';
  } else {
    dayKanjiEl.style.color = 'var(--led-color)';
  }

  // Rokuyo
  rokuyoValEl.textContent = calculateRokuyo(now);

  // Temperature & Humidity
  tempValEl.textContent = state.temp.toFixed(1);
  humValEl.textContent = String(Math.round(state.humidity));
}

// Find nearest station from user's GPS coords
function findNearestStation(lat, lon) {
  let nearest = JMA_STATIONS.tokyo;
  let minDist = Infinity;
  for (const key in JMA_STATIONS) {
    const s = JMA_STATIONS[key];
    const d = Math.pow(s.lat - lat, 2) + Math.pow(s.lon - lon, 2);
    if (d < minDist) {
      minDist = d;
      nearest = s;
    }
  }
  return nearest;
}

// Fetch Official JMA AMeDAS Real-Time Weather
async function fetchJmaWeather(station) {
  try {
    radioSignalEl.classList.add('syncing');
    locTextEl.textContent = `${station.name} 受信中...`;

    // 1. Fetch latest observation timestamp
    const tRes = await fetch('https://www.jma.go.jp/bosai/amedas/data/latest_time.txt');
    if (!tRes.ok) throw new Error('JMA timestamp fetch failed');
    const timeText = (await tRes.text()).trim();
    // Format: 2026-11-05T17:40:00+09:00 -> 20261105174000
    const formattedTime = timeText.split('+')[0].replace(/[-:T]/g, '');

    // 2. Fetch AMeDAS Map Data
    const dRes = await fetch(`https://www.jma.go.jp/bosai/amedas/data/map/${formattedTime}.json`);
    if (!dRes.ok) throw new Error('JMA data fetch failed');
    const amedasMap = await dRes.json();

    const stData = amedasMap[station.id];
    if (stData) {
      const tempVal = stData.temp ? stData.temp[0] : null;
      const humVal = stData.humidity ? stData.humidity[0] : null;

      if (tempVal !== null && tempVal !== undefined) {
        state.temp = tempVal;
      }
      if (humVal !== null && humVal !== undefined) {
        state.humidity = humVal;
      }

      state.locationName = station.name;
      const timePart = timeText.substring(11, 16); // e.g. "17:40"
      state.lastUpdatedTime = timePart;
      
      locTextEl.textContent = `${station.name} (${state.temp.toFixed(1)}℃ / ${state.humidity}% ${timePart}観測)`;

      // Sync settings UI & LocalStorage
      manualTempSlider.value = state.temp;
      manualTempLabel.textContent = state.temp.toFixed(1);
      manualHumSlider.value = state.humidity;
      manualHumLabel.textContent = state.humidity;
      localStorage.setItem('clock_temp', state.temp);
      localStorage.setItem('clock_humidity', state.humidity);
      localStorage.setItem('clock_loc_name', station.name);

      updateClock();
      console.log(`[Weather OK] JMA AMeDAS ${station.name}: ${state.temp}℃ / ${state.humidity}%`);
      return true;
    }
  } catch (err) {
    console.warn('[Weather JMA fallback error]:', err);
  } finally {
    radioSignalEl.classList.remove('syncing');
  }
  return false;
}

// Fallback to Open-Meteo if needed (e.g. Overseas)
async function fetchOpenMeteo(lat, lon, label) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m&timezone=auto`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.current) {
        state.temp = data.current.temperature_2m;
        state.humidity = data.current.relative_humidity_2m;
        state.locationName = label;
        locTextEl.textContent = `${label} (${state.temp.toFixed(1)}℃ / ${state.humidity}%)`;
        updateClock();
        return true;
      }
    }
  } catch (_) {}
  return false;
}

// Master Weather Sync Strategy
async function fetchCurrentWeather() {
  if (!state.gpsWeatherEnabled) {
    locTextEl.textContent = '手動設定モード';
    return;
  }

  // If specific preset city selected
  if (state.selectedCity !== 'gps' && JMA_STATIONS[state.selectedCity]) {
    await fetchJmaWeather(JMA_STATIONS[state.selectedCity]);
    return;
  }

  // GPS auto-detection
  if ('geolocation' in navigator) {
    locTextEl.textContent = 'GPS測位中...';
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearest = findNearestStation(latitude, longitude);
        console.log(`[GPS] Nearest JMA Station: ${nearest.name} (from lat=${latitude}, lon=${longitude})`);
        
        // Try JMA AMeDAS first
        const jmaOk = await fetchJmaWeather(nearest);
        if (!jmaOk) {
          // Fallback to Open-Meteo
          await fetchOpenMeteo(latitude, longitude, nearest.name);
        }
      },
      async (err) => {
        console.warn('[GPS unavailable]:', err.message);
        // Fallback: Default to Tokyo or Sapporo
        locTextEl.textContent = '東京 (デフォルト観測)';
        await fetchJmaWeather(JMA_STATIONS.tokyo);
      },
      { timeout: 7000, enableHighAccuracy: false }
    );
  } else {
    await fetchJmaWeather(JMA_STATIONS.tokyo);
  }
}

// Screen Wake Lock API
async function requestWakeLock() {
  if ('wakeLock' in navigator && state.wakeLockEnabled) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Screen Wake Lock active');
      wakeLock.addEventListener('release', () => {
        console.log('Screen Wake Lock released');
      });
    } catch (err) {
      console.warn(`Wake Lock error: ${err.name}, ${err.message}`);
    }
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && state.wakeLockEnabled) {
    requestWakeLock();
  }
});

// Theme Setting
function applyTheme(themeName) {
  document.body.className = themeName;
  state.theme = themeName;
  localStorage.setItem('clock_theme', themeName);

  themeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === themeName);
  });
}

// Brightness Dimmer Setting
function applyBrightness(val) {
  state.brightness = val;
  clockFrameEl.style.filter = `brightness(${val}%)`;
  localStorage.setItem('clock_brightness', val);
}

// Fullscreen Toggle
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn('Fullscreen request failed:', err);
    });
  } else {
    document.exitFullscreen();
  }
}

// Auto-hide settings button on inactivity
let hideTimer = null;
function resetAutoHide() {
  settingsToggleBtn.style.opacity = '0.7';
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (!settingsModalEl.classList.contains('open')) {
      settingsToggleBtn.style.opacity = '0.15';
    }
  }, 4000);
}

document.addEventListener('mousemove', resetAutoHide);
document.addEventListener('touchstart', resetAutoHide);

// Event Listeners
settingsToggleBtn.addEventListener('click', () => {
  settingsModalEl.classList.add('open');
  settingsToggleBtn.style.opacity = '1';
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModalEl.classList.remove('open');
  resetAutoHide();
});

settingsModalEl.addEventListener('click', (e) => {
  if (e.target === settingsModalEl) {
    settingsModalEl.classList.remove('open');
    resetAutoHide();
  }
});

themeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    applyTheme(btn.dataset.theme);
  });
});

brightnessSlider.addEventListener('input', (e) => {
  applyBrightness(e.target.value);
});

wakeLockSwitch.addEventListener('change', (e) => {
  state.wakeLockEnabled = e.target.checked;
  localStorage.setItem('clock_wakelock', state.wakeLockEnabled);
  if (state.wakeLockEnabled) {
    requestWakeLock();
  } else if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
});

gpsWeatherSwitch.addEventListener('change', (e) => {
  state.gpsWeatherEnabled = e.target.checked;
  localStorage.setItem('clock_gps_weather', state.gpsWeatherEnabled);
  if (state.gpsWeatherEnabled) {
    fetchCurrentWeather();
  } else {
    locTextEl.textContent = '手動設定モード';
  }
});

citySelect.addEventListener('change', (e) => {
  state.selectedCity = e.target.value;
  localStorage.setItem('clock_city', state.selectedCity);
  if (state.gpsWeatherEnabled) {
    fetchCurrentWeather();
  }
});

manualTempSlider.addEventListener('input', (e) => {
  state.temp = parseFloat(e.target.value);
  manualTempLabel.textContent = state.temp.toFixed(1);
  localStorage.setItem('clock_temp', state.temp);
  updateClock();
});

manualHumSlider.addEventListener('input', (e) => {
  state.humidity = parseInt(e.target.value, 10);
  manualHumLabel.textContent = state.humidity;
  localStorage.setItem('clock_humidity', state.humidity);
  updateClock();
});

btn24h.addEventListener('click', () => {
  state.is24Hour = true;
  btn24h.classList.add('active');
  btn12h.classList.remove('active');
  updateClock();
});

btn12h.addEventListener('click', () => {
  state.is24Hour = false;
  btn12h.classList.add('active');
  btn24h.classList.remove('active');
  updateClock();
});

fullscreenBtn.addEventListener('click', toggleFullscreen);

// Tap location text to instantly re-sync
locTextEl.addEventListener('click', () => {
  fetchCurrentWeather();
});

// Initialization
function init() {
  applyTheme(state.theme);
  applyBrightness(state.brightness);
  brightnessSlider.value = state.brightness;
  wakeLockSwitch.checked = state.wakeLockEnabled;
  gpsWeatherSwitch.checked = state.gpsWeatherEnabled;
  citySelect.value = state.selectedCity;
  manualTempSlider.value = state.temp;
  manualTempLabel.textContent = state.temp.toFixed(1);
  manualHumSlider.value = state.humidity;
  manualHumLabel.textContent = state.humidity;

  if (state.wakeLockEnabled) {
    requestWakeLock();
  }

  updateClock();
  setInterval(updateClock, 500);

  // Auto-fetch weather on launch
  fetchCurrentWeather();
  setInterval(fetchCurrentWeather, 10 * 60 * 1000); // Check every 10 min

  resetAutoHide();
}

init();
