import { MODELS, buildProductUrl } from './data/models.js';

export const FALLBACK_PHOTO = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#e8e8ed"/>' +
  '<text x="200" y="155" font-size="18" text-anchor="middle" fill="#6e6e73" font-family="sans-serif">사진을 불러오지 못했어요</text></svg>'
);

const sheet = () => document.getElementById('sheet');
const backdrop = () => document.getElementById('sheet-backdrop');

export function openSheet(pin, onTry) {
  const model = MODELS.find((m) => m.id === pin.model);
  const el = sheet();
  const img = el.querySelector('.sheet-photo');
  img.onerror = () => { img.onerror = null; img.src = FALLBACK_PHOTO; };
  img.src = pin.photo;
  img.alt = pin.caption;
  el.querySelector('.sheet-model').textContent = model?.name ?? '';
  el.querySelector('.sheet-place').textContent = pin.place;
  el.querySelector('.sheet-caption').textContent = pin.caption;

  const link = el.querySelector('.sheet-product');
  link.href = model ? buildProductUrl(model, 'sheet') : 'https://huug.kr/';
  link.dataset.model = pin.model;

  el.querySelector('.sheet-try').onclick = () => { closeSheet(); onTry(pin.model); };

  el.hidden = false;
  backdrop().hidden = false;
}

export function closeSheet() {
  sheet().hidden = true;
  backdrop().hidden = true;
}

export function initSheet() {
  backdrop().addEventListener('click', closeSheet);
  sheet().querySelector('.sheet-close').addEventListener('click', closeSheet);
}
