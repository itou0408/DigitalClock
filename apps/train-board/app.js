// Preset Lines Data
const LINE_PRESETS = {
  ainokaze: {
    name: 'あいの風とやま鉄道線',
    icon: '🚆',
    ticker: '平常通り運行しております。足元にご注意の上ご乗車ください。駆け込み乗車は危険ですのでおやめください。',
    trains: [
      { type: 'local', dest: '泊', via: '富山・魚津方面', offsetMin: 1 },
      { type: 'local', dest: '金沢', via: '高岡・金沢方面', offsetMin: 9 },
      { type: 'rapid', dest: '富山', via: '魚津方面', offsetMin: 28 },
      { type: 'local', dest: '高岡', via: '高岡方面', offsetMin: 45 }
    ]
  },
  yamanote: {
    name: 'JR 山手線 (内回り)',
    icon: '🟩',
    ticker: 'JR東日本をご利用いただきありがとうございます。山手線は平常通り運行しております。',
    trains: [
      { type: 'local', dest: '品川・東京方面', via: '内回り', offsetMin: 2 },
      { type: 'local', dest: '品川・東京方面', via: '内回り', offsetMin: 5 },
      { type: 'local', dest: '品川・東京方面', via: '内回り', offsetMin: 9 },
      { type: 'local', dest: '品川・東京方面', via: '内回り', offsetMin: 13 }
    ]
  },
  tokaido: {
    name: 'JR 東海道線',
    icon: '🟧',
    ticker: '東海道線は平常運転です。特急湘南号をご利用の際は特急券をお買い求めください。',
    trains: [
      { type: 'local', dest: '熱海', via: '小田原方面', offsetMin: 4 },
      { type: 'rapid', dest: '小田原', via: 'アクティー', offsetMin: 15 },
      { type: 'express', dest: '伊豆急下田', via: '特急踊り子', offsetMin: 32 }
    ]
  },
  chuo: {
    name: 'JR 中央線快速',
    icon: '🟥',
    ticker: '中央線快速電車は平常運転です。車内でのマナー向上にご協力をお願いいたします。',
    trains: [
      { type: 'rapid', dest: '高尾', via: '新宿・八王子方面', offsetMin: 3 },
      { type: 'express', dest: '青梅', via: '青梅特快', offsetMin: 7 },
      { type: 'rapid', dest: '豊田', via: '立川方面', offsetMin: 14 }
    ]
  },
  hakodate: {
    name: 'JR 函館本線',
    icon: '🟦',
    ticker: '函館本線は定時運行を行っております。冬期間は足元が滑りやすくなっておりますのでご注意ください。',
    trains: [
      { type: 'rapid', dest: '新千歳空港', via: '快速エアポート', offsetMin: 5 },
      { type: 'local', dest: '小樽', via: '手稲方面', offsetMin: 12 },
      { type: 'local', dest: '岩見沢', via: '江別方面', offsetMin: 22 }
    ]
  },
  shinkansen: {
    name: '北陸新幹線',
    icon: '🚅',
    ticker: '本日もJR西日本・JR東日本をご利用いただきありがとうございます。全席指定席車両がございます。',
    trains: [
      { type: 'express', dest: '東京', via: 'かがやき (全車指定)', offsetMin: 6 },
      { type: 'rapid', dest: '東京', via: 'はくたか (各駅停車)', offsetMin: 25 },
      { type: 'express', dest: '敦賀', via: 'つるぎ', offsetMin: 40 }
    ]
  }
};

// State
let currentPresetKey = localStorage.getItem('train_preset') || 'ainokaze';
let customLineTitle = localStorage.getItem('train_custom_title') || '';
let dynamicTrains = [];

// DOM
const currentClockEl = document.getElementById('currentClock');
const lineTitleEl = document.getElementById('lineTitle');
const tickerTextEl = document.getElementById('tickerText');
const trainListEl = document.getElementById('trainList');
const settingsToggleBtn = document.getElementById('settingsToggle');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettings');
const presetSelect = document.getElementById('presetSelect');
const customInputGroup = document.getElementById('customInputGroup');
const customLineNameInput = document.getElementById('customLineName');
const tickerInput = document.getElementById('tickerInput');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

// Initialize Dynamic Trains based on current clock
function generateSchedule() {
  const preset = LINE_PRESETS[currentPresetKey] || LINE_PRESETS.ainokaze;
  const now = new Date();

  dynamicTrains = preset.trains.map((t, idx) => {
    const depTime = new Date(now.getTime() + t.offsetMin * 60 * 1000);
    return {
      type: t.type,
      dest: t.dest,
      via: t.via,
      depDate: depTime
    };
  });
}

// Update clock & departures
function tick() {
  const now = new Date();
  
  // Format current clock HH:mm:ss
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  currentClockEl.textContent = `${hh}:${mm}:${ss}`;

  // Check departure times
  updateTrainDisplay(now);
}

// Render Train rows
function updateTrainDisplay(now) {
  // If first train has passed, shift and add new train at the end
  if (dynamicTrains.length > 0 && now >= dynamicTrains[0].depDate) {
    const passed = dynamicTrains.shift();
    const lastTrain = dynamicTrains[dynamicTrains.length - 1];
    const newDepDate = new Date((lastTrain ? lastTrain.depDate.getTime() : now.getTime()) + 15 * 60 * 1000);
    dynamicTrains.push({
      type: passed.type,
      dest: passed.dest,
      via: passed.via,
      depDate: newDepDate
    });
  }

  // Render top 3 trains
  trainListEl.innerHTML = '';
  const displayCount = Math.min(3, dynamicTrains.length);

  for (let i = 0; i < displayCount; i++) {
    const tr = dynamicTrains[i];
    const diffSec = Math.floor((tr.depDate - now) / 1000);
    const diffMin = Math.ceil(diffSec / 60);

    const depH = String(tr.depDate.getHours()).padStart(2, '0');
    const depM = String(tr.depDate.getMinutes()).padStart(2, '0');
    const depTimeStr = `${depH}:${depM}`;

    // Type badge class & text
    let typeClass = 'local';
    let typeText = '普通';
    if (tr.type === 'rapid') {
      typeClass = 'rapid';
      typeText = '快速';
    } else if (tr.type === 'express') {
      typeClass = 'express';
      typeText = '特急';
    }

    // Status label
    let statusClass = 'info';
    let statusText = `あと ${diffMin} 分`;

    if (diffSec <= 60) {
      statusClass = 'alert';
      statusText = 'まもなく発車';
    } else if (diffMin <= 9) {
      statusClass = 'warn';
      statusText = `あと ${diffMin} 分`;
    }

    const rowEl = document.createElement('div');
    rowEl.className = 'train-row';
    rowEl.innerHTML = `
      <div class="col-type"><span class="type-badge ${typeClass}">${typeText}</span></div>
      <div class="col-time"><span class="dep-time">${depTimeStr}</span></div>
      <div class="col-dest">
        <span class="dest-name">${tr.dest}</span>
        <span class="via-info">${tr.via}</span>
      </div>
      <div class="col-status">
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
    `;
    trainListEl.appendChild(rowEl);
  }
}

// Apply Preset
function applyPreset(key) {
  currentPresetKey = key;
  localStorage.setItem('train_preset', key);

  if (key === 'custom') {
    lineTitleEl.textContent = customLineTitle || 'カスタム発車案内';
  } else {
    const p = LINE_PRESETS[key] || LINE_PRESETS.ainokaze;
    lineTitleEl.textContent = p.name;
    tickerTextEl.textContent = p.ticker;
  }

  generateSchedule();
  tick();
}

// Event Listeners
settingsToggleBtn.addEventListener('click', () => {
  presetSelect.value = currentPresetKey;
  customInputGroup.style.display = currentPresetKey === 'custom' ? 'flex' : 'none';
  customLineNameInput.value = customLineTitle;
  tickerInput.value = tickerTextEl.textContent;
  settingsModal.classList.add('open');
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.remove('open');
});

presetSelect.addEventListener('change', (e) => {
  customInputGroup.style.display = e.target.value === 'custom' ? 'flex' : 'none';
});

saveSettingsBtn.addEventListener('click', () => {
  const chosen = presetSelect.value;
  if (chosen === 'custom') {
    customLineTitle = customLineNameInput.value || '発車標ディスプレイ';
    localStorage.setItem('train_custom_title', customLineTitle);
  }
  if (tickerInput.value) {
    tickerTextEl.textContent = tickerInput.value;
  }
  applyPreset(chosen);
  settingsModal.classList.remove('open');
});

// Click screen anywhere to cycle next preset quickly
let tapCount = 0;
document.addEventListener('dblclick', () => {
  const keys = Object.keys(LINE_PRESETS);
  const nextIdx = (keys.indexOf(currentPresetKey) + 1) % keys.length;
  applyPreset(keys[nextIdx]);
});

// Init
applyPreset(currentPresetKey);
setInterval(tick, 1000);
