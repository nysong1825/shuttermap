import { MODELS } from './data/models.js';
import { PINS } from './data/pins.js';
import { initMap, renderModelChips } from './map.js';
import { initSheet, openSheet } from './sheet.js';
import { initConvert } from './convert.js';
import { initOnboarding } from './onboarding.js';
import { matchModels } from './taste.js';
import { initTasteCard } from './tasteCard.js';
import { initAnalytics, track } from './track.js';
import { GA4_MEASUREMENT_ID } from './config.js';

initAnalytics(GA4_MEASUREMENT_ID);

if ('serviceWorker' in navigator) {
  // 새 버전의 서비스워커가 넘겨받으면 한 번만 새로고침해서 옛 화면이 남지 않게 한다.
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloaded) return;
    reloaded = true;
    location.reload();
  });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
    .then((reg) => reg.update())
    .catch(() => {});
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
// 칩을 누르면 가장 잘 맞는 카메라 1대를 카드로 보여주고 제품 보기로 이어준다.
const MODEL_BY_ID = new Map(MODELS.map((m) => [m.id, m]));
let myTasteIds = [];
const tasteCard = initTasteCard(document.getElementById('taste-card'), {
  onProductClick: (modelId) => track('product_click', { model: modelId, from: 'taste_top' }),
});
const chips = renderModelChips(document.getElementById('chips'), MODELS, (id) => {
  mapView.setModelFilter(id === 'mine' ? myTasteIds : id);
  tasteCard.show(id === 'mine');
  if (id === 'mine') track('my_taste_filter', { models: myTasteIds.join(',') });
});

const PROFILE_KEY = 'shuttermap_profile';
const PROFILE_FIELDS = ['design', 'look', 'price', 'gender', 'birthYear'];

function loadProfile() {
  try {
    const p = JSON.parse(localStorage.getItem(PROFILE_KEY));
    return p && PROFILE_FIELDS.every((k) => p[k]) ? p : null;
  } catch {
    return null;
  }
}

const retaste = document.querySelector('.retaste');

// 지도 진입: 온보딩을 닫고 취향을 반영한다. 처음에는 항상 '전체'를 보여준다.
function showMap(profile) {
  document.getElementById('intro').hidden = true; // 온보딩 뒤 소개 팝업 겹침 방지
  document.getElementById('onboarding').hidden = true;
  showScreen('map');
  const matches = matchModels(MODELS, profile);
  myTasteIds = matches.map((r) => r.id);
  tasteCard.setTop(MODEL_BY_ID.get(matches[0]?.id) ?? null, profile);
  chips.enableMine();
  chips.select('all');
  retaste.hidden = false;
}

function enterMap(profile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
  track('onboarding_complete', { ...profile });
  showMap(profile);
}

// 재방문이면 스플래시 뒤 바로 지도로, 취향은 '취향 다시 고르기'로 바꾼다.
const savedProfile = loadProfile();
const onboarding = initOnboarding(document.getElementById('onboarding'), {
  onComplete: enterMap,
  hasProfile: Boolean(savedProfile),
  onSkip: () => showMap(savedProfile),
});
retaste.addEventListener('click', () => onboarding.reopen(loadProfile() ?? savedProfile));
