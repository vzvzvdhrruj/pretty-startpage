const GRID = 20;

const GLOBAL_DEFAULTS = {
  searchUrl: "https://duckduckgo.com/?q={q}",
  theme: "mocha",
};

const THEMES = {
  mocha: {
    name: "Catppuccin Mocha",
    colors: {
      "--bg":      "#11111b",
      "--surface": "#1e1e2e",
      "--surface2":"#181825",
      "--text":    "#cdd6f4",
      "--subtext": "#a6adc8",
      "--accent":  "#cba6f7",
      "--accent2": "#89b4fa",
      "--border":  "#313244",
      "--red":     "#f38ba8",
      "--green":   "#a6e3a1",
    }
  },
  latte: {
    name: "Catppuccin Latte",
    colors: {
      "--bg":      "#eff1f5",
      "--surface": "#e6e9f0",
      "--surface2":"#dce0e8",
      "--text":    "#4c4f69",
      "--subtext": "#626d83",
      "--accent":  "#d20f39",
      "--accent2": "#1e66f5",
      "--border":  "#bcc0cc",
      "--red":     "#d20f39",
      "--green":   "#40a02b",
    }
  },
  frappe: {
    name: "Catppuccin Frappe",
    colors: {
      "--bg":      "#292c3c",
      "--surface": "#303446",
      "--surface2":"#292c3c",
      "--text":    "#c6d0f5",
      "--subtext": "#949cbb",
      "--accent":  "#ca9ee6",
      "--accent2": "#85c1dc",
      "--border":  "#414559",
      "--red":     "#e78284",
      "--green":   "#a6d189",
    }
  },
  macchiato: {
    name: "Catppuccin Macchiato",
    colors: {
      "--bg":      "#24273a",
      "--surface": "#2e303e",
      "--surface2":"#1e1e2e",
      "--text":    "#cad3f5",
      "--subtext": "#8087a2",
      "--accent":  "#c6a0f6",
      "--accent2": "#8aadf4",
      "--border":  "#3b3f52",
      "--red":     "#ed8796",
      "--green":   "#a6da95",
    }
  }
};

const PRESETS = {
  "https://duckduckgo.com/?q={q}": "DuckDuckGo",
  "https://www.google.com/search?q={q}": "Google",
  "https://www.startpage.com/search?q={q}": "Startpage",
  "https://www.qwant.com/?q={q}": "Qwant",
  "https://yandex.com/search/?text={q}": "Yandex"
};

const WIDGET_DEFS = {
  clock: {
    label: "Clock",
    defaultW: 260,
    defaultH: 110,
    defaultSettings: {
      hourFormat: "auto",
      timezone: "system",
      clockFont: "'M PLUS 1 Code', monospace",
      showSeconds: false,
    },
    render(el, settings) {
      el.innerHTML = `
        <div class="w-clock">
          <div class="w-clock-time">--:--</div>
          <div class="w-clock-tz"></div>
        </div>`;
      this._update(el, settings);
      const id = setInterval(() => this._update(el, settings), 1000);
      el.dataset.intervalId = id;
    },
    _update(el, settings) {
      const timeEl = el.querySelector('.w-clock-time');
      const tzEl = el.querySelector('.w-clock-tz');
      if (!timeEl) return;
      const tz = settings.timezone === 'system' ? undefined : settings.timezone;
      const opts = { timeStyle: settings.showSeconds ? 'medium' : 'short' };
      if (settings.hourFormat === '12') opts.hour12 = true;
      else if (settings.hourFormat === '24') opts.hour12 = false;
      try {
        const fmt = new Intl.DateTimeFormat([], { ...opts, ...(tz ? { timeZone: tz } : {}) });
        timeEl.textContent = fmt.format(new Date());
        timeEl.style.fontFamily = settings.clockFont;
      } catch {
        timeEl.textContent = new Date().toLocaleTimeString();
      }
      tzEl.textContent = settings.timezone === 'system'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : settings.timezone;
    },
    cleanup(el) {
      if (el.dataset.intervalId) clearInterval(Number(el.dataset.intervalId));
    },
    settingsForm(settings) {
      return `
        <div class="form-group">
          <label>Hour format</label>
          <select name="hourFormat">
            <option value="auto" ${settings.hourFormat==='auto'?'selected':''}>Auto (locale)</option>
            <option value="12" ${settings.hourFormat==='12'?'selected':''}>12-hour (AM/PM)</option>
            <option value="24" ${settings.hourFormat==='24'?'selected':''}>24-hour</option>
          </select>
        </div>
        <div class="form-group">
          <label>Timezone (IANA)</label>
          <input type="text" name="timezone" value="${settings.timezone}" placeholder="system, UTC, Europe/London" />
          <small>Type "system" for your local timezone</small>
        </div>
        <div class="form-group">
          <label>Clock font</label>
          <select name="clockFont">
            <option value="'M PLUS 1 Code', monospace" ${settings.clockFont.includes('M PLUS')?'selected':''}>M+ Code</option>
            <option value="'Roboto Mono', monospace" ${settings.clockFont.includes('Roboto')?'selected':''}>Roboto Mono</option>
            <option value="'Courier New', monospace" ${settings.clockFont.includes('Courier')?'selected':''}>Courier New</option>
            <option value="system-ui" ${settings.clockFont==='system-ui'?'selected':''}>System UI</option>
          </select>
        </div>
        <div class="form-group form-row-check">
          <label class="check-label">
            <input type="checkbox" name="showSeconds" ${settings.showSeconds?'checked':''} />
            Show seconds
          </label>
        </div>`;
    },
    readForm(form) {
      return {
        hourFormat: form.hourFormat.value,
        timezone: form.timezone.value.trim() || 'system',
        clockFont: form.clockFont.value,
        showSeconds: form.showSeconds.checked,
      };
    },
  },

  search: {
    label: "Search",
    defaultW: 540,
    defaultH: 70,
    defaultSettings: {
      searchUrl: "https://duckduckgo.com/?q={q}",
      placeholder: "Search the web…",
    },
    render(el, settings) {
      const engineName = this._engineName(settings.searchUrl);
      el.innerHTML = `
        <div class="w-search">
          <form class="w-search-form" id="searchForm-${el.closest('.widget').dataset.id}">
            <input class="search-input" type="text" placeholder="${settings.placeholder || 'Search ' + engineName + '…'}" autocomplete="off" />
            <button class="btn-primary" type="submit">Search</button>
          </form>
        </div>`;
      const form = el.querySelector('form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = el.querySelector('input').value.trim();
        if (!q) return;
        window.location.href = settings.searchUrl.replace('{q}', encodeURIComponent(q));
      });
      window._searchWidgetInput = el.querySelector('input');
    },
    _engineName(url) {
      try { return new URL(url).hostname.replace('www.','').split('.')[0]; } catch { return 'web'; }
    },
    cleanup() {},
    settingsForm(settings) {
      return `
        <div class="form-group">
          <label>Search engine preset</label>
          <select name="searchEnginePreset" id="swPreset">
            <option value="custom">Custom</option>
            <option value="https://duckduckgo.com/?q={q}" ${settings.searchUrl.includes('duckduckgo')?'selected':''}>DuckDuckGo</option>
            <option value="https://www.google.com/search?q={q}" ${settings.searchUrl.includes('google')?'selected':''}>Google</option>
            <option value="https://www.startpage.com/search?q={q}" ${settings.searchUrl.includes('startpage')?'selected':''}>Startpage</option>
            <option value="https://www.qwant.com/?q={q}" ${settings.searchUrl.includes('qwant')?'selected':''}>Qwant</option>
            <option value="https://yandex.com/search/?text={q}" ${settings.searchUrl.includes('yandex')?'selected':''}>Yandex</option>
          </select>
        </div>
        <div class="form-group">
          <label>Custom URL (use {q} for query)</label>
          <input type="text" name="searchUrl" id="swUrl" value="${settings.searchUrl}" />
        </div>
        <div class="form-group">
          <label>Placeholder text</label>
          <input type="text" name="placeholder" value="${settings.placeholder || ''}" placeholder="Search the web…" />
        </div>`;
    },
    readForm(form) {
      const preset = form.searchEnginePreset.value;
      return {
        searchUrl: preset !== 'custom' ? preset : (form.searchUrl.value.trim() || 'https://duckduckgo.com/?q={q}'),
        placeholder: form.placeholder.value.trim(),
      };
    },
  },

  weather: {
    label: "Weather",
    defaultW: 280,
    defaultH: 160,
    defaultSettings: {
      city: "London",
      units: "metric",
    },
    render(el, settings) {
      el.innerHTML = `<div class="w-weather"><div class="w-weather-loading">Loading…</div></div>`;
      this._fetch(el, settings);
    },
    async _fetch(el, settings) {
      const box = el.querySelector('.w-weather');
      try {
        const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(settings.city)}&count=1`);
        const geoData = await geo.json();
        if (!geoData.results?.length) {
          box.innerHTML = `<div class="w-weather-error">City not found: ${settings.city}</div>`;
          return;
        }
        const { latitude, longitude, name, country } = geoData.results[0];
        const unit = settings.units === 'imperial' ? 'fahrenheit' : 'celsius';
        const wx = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=${unit}&wind_speed_unit=kmh`);
        const wxData = await wx.json();
        const cw = wxData.current_weather;
        const deg = settings.units === 'imperial' ? '°F' : '°C';
        box.innerHTML = `
          <div class="w-weather-inner">
            <div class="w-weather-info">
              <div class="w-weather-temp">${Math.round(cw.temperature)}${deg}</div>
              <div class="w-weather-desc">${this._desc(cw.weathercode)}</div>
              <div class="w-weather-city">${name}, ${country}</div>
              <div class="w-weather-wind">Wind ${cw.windspeed} km/h</div>
            </div>
          </div>`;
      } catch {
        box.innerHTML = `<div class="w-weather-error">Unable to load weather</div>`;
      }
    },
    _desc(code) {
      const map = {0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Foggy',48:'Icy fog',51:'Light drizzle',61:'Light rain',63:'Moderate rain',65:'Heavy rain',71:'Light snow',73:'Moderate snow',75:'Heavy snow',80:'Rain showers',81:'Moderate showers',82:'Heavy showers',95:'Thunderstorm',99:'Thunderstorm with hail'};
      return map[code] || 'Unknown';
    },
    cleanup() {},
    settingsForm(settings) {
      return `
        <div class="form-group">
          <label>City</label>
          <input type="text" name="city" value="${settings.city}" placeholder="London, New York, Tokyo…" />
        </div>
        <div class="form-group">
          <label>Units</label>
          <select name="units">
            <option value="metric" ${settings.units==='metric'?'selected':''}>Metric (°C)</option>
            <option value="imperial" ${settings.units==='imperial'?'selected':''}>Imperial (°F)</option>
          </select>
        </div>`;
    },
    readForm(form) {
      return {
        city: form.city.value.trim() || 'London',
        units: form.units.value,
      };
    },
  },
};

let state = {
  widgets: [],
  editMode: false,
};

let globalSettings = {
  searchUrl: GLOBAL_DEFAULTS.searchUrl,
  theme: GLOBAL_DEFAULTS.theme,
};

function loadGlobalSettings() {
  try {
    const g = localStorage.getItem('startpage-global');
    if (g) globalSettings = { ...globalSettings, ...JSON.parse(g) };
  } catch {}
}

function loadState() {
  try {
    const s = localStorage.getItem('startpage-v2');
    if (s) state = JSON.parse(s);
  } catch {}
  if (!state.widgets.length) {
    const cw = window.innerWidth, ch = window.innerHeight;
    state.widgets = [
      { id: uid(), type: 'clock',  x: snap(cw/2 - 130), y: snap(ch/2 - 120), w: 260, h: 110, settings: { ...WIDGET_DEFS.clock.defaultSettings } },
      { id: uid(), type: 'search', x: snap(cw/2 - 270), y: snap(ch/2 + 10),  w: 540, h: 70,  settings: { ...WIDGET_DEFS.search.defaultSettings } },
    ];
  }
}

function saveState() {
  localStorage.setItem('startpage-v2', JSON.stringify(state));
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function snap(v) {
  return Math.round(v / GRID) * GRID;
}

function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
}

function updateFooter() {
  const footer = document.getElementById('footer');
  const themeName = THEMES[globalSettings.theme]?.name || 'Catppuccin Mocha';
  footer.textContent = `${themeName} :)`;
}

const canvas = document.getElementById('canvas');

function renderAll() {
  canvas.querySelectorAll('.widget').forEach(el => {
    if (!state.widgets.find(w => w.id === el.dataset.id)) {
      const def = WIDGET_DEFS[el.dataset.type];
      if (def?.cleanup) def.cleanup(el.querySelector('.widget-body'));
      el.remove();
    }
  });

  state.widgets.forEach(w => {
    let el = canvas.querySelector(`.widget[data-id="${w.id}"]`);
    const isNew = !el;
    if (isNew) {
      el = document.createElement('div');
      el.className = 'widget';
      el.dataset.id = w.id;
      el.dataset.type = w.type;
      el.innerHTML = `
        <div class="widget-edit-bar">
          <button class="widget-settings-btn" title="Widget settings">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 0 1 4.29 17l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 0 1 7.04 4.3l.06.06A1.65 1.65 0 0 0 8.92 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button class="widget-remove-btn" title="Remove widget">✕</button>
        </div>
        <div class="widget-body"></div>
        <div class="resize-handle resize-e"></div>
        <div class="resize-handle resize-s"></div>
        <div class="resize-handle resize-se"></div>`;
      canvas.appendChild(el);

      el.querySelector('.widget-settings-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openWidgetSettings(w.id);
      });
      el.querySelector('.widget-remove-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        removeWidget(w.id);
      });

      makeDraggable(el, w);
      makeResizable(el, w);
    }

    el.style.left = w.x + 'px';
    el.style.top  = w.y + 'px';
    el.style.width  = w.w + 'px';
    el.style.height = w.h + 'px';

    el.classList.toggle('edit-mode', state.editMode);

    if (isNew || el.dataset.settingsHash !== JSON.stringify(w.settings)) {
      const def = WIDGET_DEFS[w.type];
      const body = el.querySelector('.widget-body');
      if (def?.cleanup) def.cleanup(body);
      def.render(body, w.settings);
      el.dataset.settingsHash = JSON.stringify(w.settings);
    }
  });
}

function removeWidget(id) {
  const el = canvas.querySelector(`.widget[data-id="${id}"]`);
  if (el) {
    const def = WIDGET_DEFS[el.dataset.type];
    if (def?.cleanup) def.cleanup(el.querySelector('.widget-body'));
    el.remove();
  }
  state.widgets = state.widgets.filter(w => w.id !== id);
  saveState();
}

function makeDraggable(el, wData) {
  let startX, startY, startLeft, startTop, dragging = false;

  el.addEventListener('mousedown', (e) => {
    if (!state.editMode) return;
    if (e.target.closest('.resize-handle') || e.target.closest('.widget-edit-bar')) return;
    e.preventDefault();
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = wData.x;
    startTop  = wData.y;
    el.classList.add('dragging');
    el.style.zIndex = 999;
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const nx = snap(startLeft + e.clientX - startX);
    const ny = snap(startTop  + e.clientY - startY);
    wData.x = Math.max(0, nx);
    wData.y = Math.max(0, ny);
    el.style.left = wData.x + 'px';
    el.style.top  = wData.y + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('dragging');
    el.style.zIndex = '';
    saveState();
  });
}

function makeResizable(el, wData) {
  el.querySelectorAll('.resize-handle').forEach(handle => {
    let startX, startY, startW, startH, resizing = false;
    const dir = handle.classList[1];

    handle.addEventListener('mousedown', (e) => {
      if (!state.editMode) return;
      e.preventDefault();
      e.stopPropagation();
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startW = wData.w;
      startH = wData.h;
    });

    document.addEventListener('mousemove', (e) => {
      if (!resizing) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (dir === 'resize-e' || dir === 'resize-se') wData.w = Math.max(160, snap(startW + dx));
      if (dir === 'resize-s' || dir === 'resize-se') wData.h = Math.max(60, snap(startH + dy));
      el.style.width  = wData.w + 'px';
      el.style.height = wData.h + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!resizing) return;
      resizing = false;
      saveState();
    });
  });
}

const editModeBtn  = document.getElementById('editModeBtn');
const doneEditBtn  = document.getElementById('doneEditBtn');
const editBanner   = document.getElementById('editBanner');
const addWidgetBtn = document.getElementById('addWidgetBtn');

editModeBtn.addEventListener('click', () => {
  state.editMode = true;
  applyEditMode();
});

doneEditBtn.addEventListener('click', () => {
  state.editMode = false;
  applyEditMode();
  saveState();
});

function applyEditMode() {
  document.body.classList.toggle('edit-mode', state.editMode);
  editBanner.classList.toggle('visible', state.editMode);
  addWidgetBtn.classList.toggle('visible', state.editMode);
  canvas.querySelectorAll('.widget').forEach(el => el.classList.toggle('edit-mode', state.editMode));
}

const widgetPicker = document.getElementById('widgetPicker');
const pickerList   = document.getElementById('pickerList');
const pickerClose  = document.getElementById('pickerClose');

addWidgetBtn.addEventListener('click', () => {
  pickerList.innerHTML = '';
  Object.entries(WIDGET_DEFS).forEach(([type, def]) => {
    const btn = document.createElement('button');
    btn.className = 'picker-item';
    btn.innerHTML = `<span>${def.label}</span>`;
    btn.addEventListener('click', () => {
      addWidget(type);
      widgetPicker.classList.remove('visible');
    });
    pickerList.appendChild(btn);
  });
  widgetPicker.classList.add('visible');
});

pickerClose.addEventListener('click', () => widgetPicker.classList.remove('visible'));

function addWidget(type) {
  const def = WIDGET_DEFS[type];
  const id = uid();
  const x = snap(Math.max(0, window.innerWidth / 2 - def.defaultW / 2));
  const y = snap(Math.max(0, window.innerHeight / 2 - def.defaultH / 2));
  state.widgets.push({ id, type, x, y, w: def.defaultW, h: def.defaultH, settings: { ...def.defaultSettings } });
  saveState();
  renderAll();
}

const sidebar         = document.getElementById('settingsSidebar');
const sidebarTitle    = document.getElementById('sidebarTitle');
const sidebarBody     = document.getElementById('sidebarBody');
const sidebarClose    = document.getElementById('sidebarClose');
const sidebarCancel   = document.getElementById('sidebarCancel');
const sidebarSave     = document.getElementById('sidebarSave');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

let activeSidebarWidgetId = null;

function openWidgetSettings(id) {
  const w = state.widgets.find(w => w.id === id);
  if (!w) return;
  const def = WIDGET_DEFS[w.type];
  activeSidebarWidgetId = id;
  sidebarTitle.textContent = def.label + ' Settings';
  sidebarBody.innerHTML = `<form id="widgetSettingsForm">${def.settingsForm(w.settings)}</form>`;

  const preset = sidebarBody.querySelector('#swPreset');
  const urlInput = sidebarBody.querySelector('#swUrl');
  if (preset && urlInput) {
    preset.addEventListener('change', () => {
      if (preset.value !== 'custom') urlInput.value = preset.value;
    });
    urlInput.addEventListener('input', () => {
      preset.value = PRESETS[urlInput.value.trim()] ? urlInput.value.trim() : 'custom';
    });
  }

  sidebar.classList.add('open');
  sidebarBackdrop.classList.add('open');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.remove('open');
  activeSidebarWidgetId = null;
}

sidebarClose.addEventListener('click', closeSidebar);
sidebarCancel.addEventListener('click', closeSidebar);
sidebarBackdrop.addEventListener('click', closeSidebar);

sidebarSave.addEventListener('click', () => {
  if (!activeSidebarWidgetId) return;
  const w = state.widgets.find(w => w.id === activeSidebarWidgetId);
  const form = document.getElementById('widgetSettingsForm');
  if (!w || !form) return;
  w.settings = WIDGET_DEFS[w.type].readForm(form);
  const el = canvas.querySelector(`.widget[data-id="${w.id}"]`);
  if (el) el.dataset.settingsHash = '';
  saveState();
  renderAll();
  closeSidebar();
});

const modal          = document.getElementById('modal');
const openSettings   = document.getElementById('openSettings');
const closeBtn       = document.getElementById('closeBtn');
const saveBtn        = document.getElementById('saveBtn');
const themeSelect    = document.getElementById('theme');
const searchUrlInput = document.getElementById('searchUrl');
const presetSelect   = document.getElementById('searchEnginePreset');

openSettings.addEventListener('click', () => {
  themeSelect.value = globalSettings.theme;
  searchUrlInput.value = globalSettings.searchUrl;
  presetSelect.value = PRESETS[globalSettings.searchUrl] ? globalSettings.searchUrl : 'custom';
  modal.classList.add('open');
});

closeBtn.addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

presetSelect.addEventListener('change', () => {
  if (presetSelect.value !== 'custom') searchUrlInput.value = presetSelect.value;
});
searchUrlInput.addEventListener('input', () => {
  presetSelect.value = PRESETS[searchUrlInput.value.trim()] ? searchUrlInput.value.trim() : 'custom';
});

saveBtn.addEventListener('click', () => {
  globalSettings.searchUrl = searchUrlInput.value.trim() || GLOBAL_DEFAULTS.searchUrl;
  globalSettings.theme = themeSelect.value;
  
  localStorage.setItem('startpage-global', JSON.stringify(globalSettings));
  
  applyTheme(globalSettings.theme);
  updateFooter();
  
  modal.classList.remove('open');
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (window._searchWidgetInput) window._searchWidgetInput.focus();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    modal.classList.add('open');
  }
  if (e.key === 'Escape') {
    modal.classList.remove('open');
    closeSidebar();
    widgetPicker.classList.remove('visible');
  }
});

loadGlobalSettings();
loadState();
applyTheme(globalSettings.theme);
updateFooter();
renderAll();