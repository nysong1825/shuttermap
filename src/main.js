import { MODELS } from './data/models.js';
import { PINS } from './data/pins.js';
import { initMap, renderModelChips } from './map.js';
import { initSheet, openSheet } from './sheet.js';
import { initConvert } from './convert.js';

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

const convert = initConvert(document.getElementById('screen-convert'));

function tryModel(modelId) {
  showScreen('convert');
  convert.selectModel(modelId);
}

initSheet();
mapView = initMap(document.getElementById('map'), PINS, (pin) => openSheet(pin, tryModel));
renderModelChips(document.getElementById('chips'), MODELS, (id) => mapView.setModelFilter(id));
