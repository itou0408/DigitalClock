// City Presets (Default matches photo: Toyama)
const CITY_DATA = {
  toyama: {
    name: '富山',
    lat: 36.695,
    lon: 137.213,
    defaultCond: '曇りがち',
    icon: '⛅',
    temp: 15,
    high: 16,
    low: 14,
    hum: 39,
    hourly: [
      { time: '12', icon: '🌧', temp: 12, pop: '80%' },
      { time: '15', icon: '⛅', temp: 11, pop: '8%' },
      { time: '18', icon: '⛅', temp: 11, pop: '4%' },
      { time: '21', icon: '☁️', temp: 10, pop: '0%' },
      { time: '0',  icon: '⛅', temp: 12, pop: '0%' },
      { time: '3',  icon: '⛅', temp: 15, pop: '0%' },
      { time: '6',  icon: '⛅', temp: 14, pop: '10%' }
    ]
  },
  tokyo: {
    name: '東京',
    lat: 35.689,
    lon: 139.692,
    defaultCond: '晴れ時々曇',
    icon: '☀️',
    temp: 18,
    high: 20,
    low: 12,
    hum: 48,
    hourly: [
      { time: '12', icon: '☀️', temp: 19, pop: '0%' },
      { time: '15', icon: '☀️', temp: 20, pop: '0%' },
      { time: '18', icon: '⛅', temp: 16, pop: '10%' },
      { time: '21', icon: '☁️', temp: 14, pop: '10%' },
      { time: '0',  icon: '☁️', temp: 13, pop: '10%' },
      { time: '3',  icon: '⛅', temp: 12, pop: '0%' },
      { time: '6',  icon: '☀️', temp: 14, pop: '0%' }
    ]
  },
  osaka: {
    name: '大阪',
    lat: 34.693,
    lon: 135.502,
    defaultCond: '快晴',
    icon: '☀️',
    temp: 19,
    high: 21,
    low: 13,
    hum: 42,
    hourly: [
      { time: '12', icon: '☀️', temp: 20, pop: '0%' },
      { time: '15', icon: '☀️', temp: 21, pop: '0%' },
      { time: '18', icon: '☀️', temp: 17, pop: '0%' },
      { time: '21', icon: '🌙', temp: 15, pop: '0%' },
      { time: '0',  icon: '🌙', temp: 14, pop: '0%' },
      { time: '3',  icon: '🌙', temp: 13, pop: '0%' },
      { time: '6',  icon: '☀️', temp: 15, pop: '0%' }
    ]
  },
  sapporo: {
    name: '札幌',
    lat: 43.062,
    lon: 141.354,
    defaultCond: '雨のち雪',
    icon: '❄️',
    temp: 6,
    high: 8,
    low: 2,
    hum: 65,
    hourly: [
      { time: '12', icon: '🌧', temp: 7, pop: '70%' },
      { time: '15', icon: '🌧', temp: 6, pop: '60%' },
      { time: '18', icon: '🌨', temp: 4, pop: '50%' },
      { time: '21', icon: '❄️', temp: 3, pop: '40%' },
      { time: '0',  icon: '❄️', temp: 2, pop: '30%' },
      { time: '3',  icon: '❄️', temp: 2, pop: '20%' },
      { time: '6',  icon: '⛅', temp: 3, pop: '10%' }
    ]
  },
  fukuoka: {
    name: '福岡',
    lat: 33.590,
    lon: 130.401,
    defaultCond: '晴れ',
    icon: '☀️',
    temp: 20,
    high: 22,
    low: 14,
    hum: 52,
    hourly: [
      { time: '12', icon: '☀️', temp: 21, pop: '0%' },
      { time: '15', icon: '☀️', temp: 22, pop: '0%' },
      { time: '18', icon: '⛅', temp: 18, pop: '0%' },
      { time: '21', icon: '🌙', temp: 16, pop: '10%' },
      { time: '0',  icon: '🌙', temp: 15, pop: '10%' },
      { time: '3',  icon: '🌙', temp: 14, pop: '10%' },
      { time: '6',  icon: '☀️', temp: 16, pop: '0%' }
    ]
  },
  nagoya: {
    name: '名古屋',
    lat: 35.181,
    lon: 136.906,
    defaultCond: 'うす曇り',
    icon: '⛅',
    temp: 17,
    high: 19,
    low: 11,
    hum: 45,
    hourly: [
      { time: '12', icon: '⛅', temp: 18, pop: '10%' },
      { time: '15', icon: '⛅', temp: 19, pop: '10%' },
      { time: '18', icon: '☁️', temp: 15, pop: '20%' },
      { time: '21', icon: '☁️', temp: 13, pop: '20%' },
      { time: '0',  icon: '☁️', temp: 12, pop: '10%' },
      { time: '3',  icon: '⛅', temp: 11, pop: '0%' },
      { time: '6',  icon: '☀️', temp: 13, pop: '0%' }
    ]
  }
};

// DOM
const flipHours = document.getElementById('flipHours');
const flipMinutes = document.getElementById('flipMinutes');
const flipSeconds = document.getElementById('flipSeconds');
const clockSubDate = document.getElementById('clockSubDate');
const clockSubWeather = document.getElementById('clockSubWeather');
const weatherCondText = document.getElementById('weatherCondText');
const cityNameLabel = document.getElementById('cityNameLabel');
const tempHigh = document.getElementById('tempHigh');
const tempLow = document.getElementById('tempLow');
const humVal = document.getElementById('humVal');
const currentTempBig = document.getElementById('currentTempBig');
const forecastTrack = document.getElementById('forecastTrack');
const citySelect = document.getElementById('citySelect');

let prevH = '', prevM = '', prevS = '';
let currentCityKey = localStorage.getItem('flip_city') || 'toyama';

// Update Flip Units with card flip effect
function setFlipNumber(unitEl, newNumStr, prevNumStr) {
  if (newNumStr !== prevNumStr) {
    const cardNums = unitEl.querySelectorAll('.card-num');
    cardNums.forEach(span => {
      span.textContent = newNumStr;
    });
    // Micro animation
    unitEl.style.transform = 'scale(0.98)';
    setTimeout(() => {
      unitEl.style.transform = 'scale(1)';
    }, 120);
  }
}

// Clock Tick
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function tickClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');

  setFlipNumber(flipHours, h, prevH);
  setFlipNumber(flipMinutes, m, prevM);
  setFlipNumber(flipSeconds, s, prevS);

  prevH = h;
  prevM = m;
  prevS = s;

  // Sub date (e.g. "Mon, Nov 24")
  const dayName = DAYS[now.getDay()];
  const monthName = MONTHS[now.getMonth()];
  const dateNum = now.getDate();
  clockSubDate.textContent = `${dayName}, ${monthName} ${dateNum}`;
}

// Render Weather
function renderWeather(key) {
  const city = CITY_DATA[key] || CITY_DATA.toyama;
  cityNameLabel.textContent = city.name;
  weatherCondText.textContent = city.defaultCond;
  currentTempBig.textContent = city.temp;
  tempHigh.textContent = city.high;
  tempLow.textContent = city.low;
  humVal.textContent = city.hum;

  clockSubWeather.textContent = `${city.icon} ${city.temp}°`;

  // Hourly track
  forecastTrack.innerHTML = '';
  city.hourly.forEach(slot => {
    const slotEl = document.createElement('div');
    slotEl.className = 'forecast-slot';
    slotEl.innerHTML = `
      <span class="slot-time">${slot.time}</span>
      <span class="slot-icon">${slot.icon}</span>
      <span class="slot-temp">${slot.temp}°</span>
      <span class="slot-pop">${slot.pop}</span>
    `;
    forecastTrack.appendChild(slotEl);
  });
}

// Fetch live weather from Open-Meteo if online
async function fetchLiveWeather(key) {
  const city = CITY_DATA[key];
  if (!city) return;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();

    const curr = data.current;
    if (curr) {
      city.temp = Math.round(curr.temperature_2m);
      city.hum = Math.round(curr.relative_humidity_2m);
      if (data.daily) {
        city.high = Math.round(data.daily.temperature_2m_max[0]);
        city.low = Math.round(data.daily.temperature_2m_min[0]);
      }
      renderWeather(key);
    }
  } catch (err) {
    console.log('Using offline preset weather data:', err);
    renderWeather(key);
  }
}

// City select event
citySelect.addEventListener('change', (e) => {
  currentCityKey = e.target.value;
  localStorage.setItem('flip_city', currentCityKey);
  renderWeather(currentCityKey);
  fetchLiveWeather(currentCityKey);
});

// Screen Wake Lock
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      await navigator.wakeLock.request('screen');
    } catch (e) {}
  }
}
document.addEventListener('click', requestWakeLock, { once: true });

// Init
citySelect.value = currentCityKey;
renderWeather(currentCityKey);
fetchLiveWeather(currentCityKey);
tickClock();
setInterval(tickClock, 500);
