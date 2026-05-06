const DEFAULTS = {
  searchUrl: "https://duckduckgo.com/?q={q}",
  hourFormat: "auto",
  timezone: "system",
  clockFont: "'Roboto Mono', monospace"
};

const modal = document.getElementById('modal');
const openSettings = document.getElementById('openSettings');
const closeBtn = document.getElementById('closeBtn');
const saveBtn = document.getElementById('saveBtn');
const searchForm = document.getElementById('searchForm');
const qInput = document.getElementById('q');
const searchUrlInput = document.getElementById('searchUrl');
const hourFormatInput = document.getElementById('hourFormat');
const timezoneInput = document.getElementById('timezone');
const clockEl = document.getElementById('clock');
const tzLabel = document.getElementById('tzLabel');
const clockFontSelect = document.getElementById('clockFont');

function loadSettings() {
  const stored = localStorage.getItem('startpage-settings');
  return stored ? Object.assign({}, DEFAULTS, JSON.parse(stored)) : DEFAULTS;
}

function saveSettings(s) {
  localStorage.setItem('startpage-settings', JSON.stringify(s));
}

function applySettings(s) {
  searchUrlInput.value = s.searchUrl;
  hourFormatInput.value = s.hourFormat;
  timezoneInput.value = s.timezone;
  clockFontSelect.value = s.clockFont;
  clockEl.style.fontFamily = s.clockFont;
  updateTZLabel(s.timezone);
}

function updateTZLabel(tz) {
  tzLabel.textContent = tz === 'system' ? Intl.DateTimeFormat().resolvedOptions().timeZone : tz;
}

function renderClock() {
  const s = loadSettings();
  const tz = s.timezone === 'system' ? undefined : s.timezone;
  
  const opts = { timeStyle: 'short' };

  if (s.hourFormat === '12') opts.hour12 = true;
  else if (s.hourFormat === '24') opts.hour12 = false;

  try {
    const formatter = new Intl.DateTimeFormat([], Object.assign({}, opts, tz ? { timeZone: tz } : {}));
    clockEl.textContent = formatter.format(new Date());
  } catch (err) {
    const formatter = new Intl.DateTimeFormat([], opts);
    clockEl.textContent = formatter.format(new Date());
  }
}

openSettings.addEventListener('click', () => {
  modal.classList.add('open');
});

closeBtn.addEventListener('click', () => {
  modal.classList.remove('open');
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.remove('open');
});

saveBtn.addEventListener('click', () => {
  const s = {
    searchUrl: (searchUrlInput.value || DEFAULTS.searchUrl).trim(),
    hourFormat: hourFormatInput.value || DEFAULTS.hourFormat,
    timezone: (timezoneInput.value || DEFAULTS.timezone).trim(),
    clockFont: clockFontSelect.value || DEFAULTS.clockFont
  };
  saveSettings(s);
  applySettings(s);
  modal.classList.remove('open');
});

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const s = loadSettings();
  const query = qInput.value.trim();
  if (!query) return;
  const url = s.searchUrl.replace('{q}', encodeURIComponent(query));
  window.location.href = url;
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    qInput.focus();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    modal.classList.add('open');
  }
});

applySettings(loadSettings());
renderClock();
setInterval(renderClock, 10000);
