import { MODELS } from './data/models.js';
import { PINS } from './data/pins.js';
import { initMap, renderModelChips } from './map.js';
import { initSheet, openSheet } from './sheet.js';
import { initConvert } from './convert.js';
import { initOnboarding } from './onboarding.js';
import { matchModels } from './taste.js';
import { initAnalytics, track } from './track.js';
import { GA4_MEASUREMENT_ID } from './config.js';

initAnalytics(GA4_MEASUREMENT_ID);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

const SCREENS = ['map', 'convert'];
let mapView;

export function showScreen(name) {
  for (const s of SCREENS) {
    document.getElementById(`screen-${s}`).hidden = s !== name;
  }
  for (const btn of document.querySelectorAll('.tabbar button')) {
    if (btn.dataset.screen === name) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  }
  if (name === 'map') mapView?.invalidate();
}

for (const btn of document.querySelectorAll('.tabbar button')) {
  btn.addEventListener('click', () => showScreen(btn.dataset.screen));
}

const INTRO_KEY = 'shuttermap_intro_seen';

function initIntro() {
  const intro = document.getElementById('intro');
  let seen = false;
  try { seen = localStorage.getItem(INTRO_KEY) === '1'; } catch {}
  intro.hidden = seen;
  intro.querySelector('.intro-start').addEventListener('click', () => {
    intro.hidden = true;
    try { localStorage.setItem(INTRO_KEY, '1'); } catch {}
  });
}

const convert = initConvert(document.getElementById('screen-convert'), {
  onConvert: (modelId) => track('photo_convert', { model: modelId }),
  onProductClick: (modelId) => track('product_click', { model: modelId, from: 'convert' }),
});

document.querySelector('.sheet-product').addEventListener('click', (e) => {
  track('product_click', { model: e.currentTarget.dataset.model, from: 'sheet' });
});

function tryModel(modelId) {
  showScreen('convert');
  convert.selectModel(modelId);
}

initSheet();
initIntro();
mapView = initMap(document.getElementById('map'), PINS, (pin) => {
  track('pin_open', { model: pin.model, place: pin.place });
  openSheet(pin, tryModel);
});
// 내 취향 칩: 온보딩에서 고른 취향과 3개 중 2개 이상 일치하는 카메라만 지도에 보인다.
let myTasteIds = [];
const chips = renderModelChips(document.getElementById('chips'), MODELS, (id) => {
  mapView.setModelFilter(id === 'mine' ? myTasteIds : id);
  if (id === 'mine') track('my_taste_filter', { models: myTasteIds.join(',') });
});

const PROFILE_KEY = 'shuttermap_profile';

function enterMap(profile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
  track('onboarding_complete', { ...profile });
  document.getElementById('intro').hidden = true; // 온보딩 직후 소개 팝업 겹침 방지
  document.getElementById('onboarding').hidden = true;
  showScreen('map');
  myTasteIds = matchModels(MODELS, profile).map((r) => r.id);
  chips.enableMine();
  chips.select('mine');
}
initOnboarding(document.getElementById('onboarding'), { onComplete: enterMap });
