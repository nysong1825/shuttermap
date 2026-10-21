import { MODELS, buildProductUrl } from './data/models.js';

export const FALLBACK_PHOTO = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#e8e8ed"/>' +
  '<text x="200" y="155" font-size="18" text-anchor="middle" fill="#6e6e73" font-family="sans-serif">사진을 불러오지 못했어요</text></svg>'
);

const sheet = () => document.getElementById('sheet');
const backdrop = () => document.getElementById('sheet-backdrop');

let photos = [];
let current = 0;

function showPhoto(i) {
  const el = sheet();
  current = (i + photos.length) % photos.length;
  const p = photos[current];
  const img = el.querySelector('.sheet-photo');
  img.onerror = () => { img.onerror = null; img.src = FALLBACK_PHOTO; };
  img.src = p.photo;
  img.alt = p.caption;
  el.querySelector('.sheet-caption').textContent = p.caption;
  el.querySelector('.sheet-count').textContent = `${current + 1} / ${photos.length}`;
  for (const [n, t] of [...el.querySelectorAll('.sheet-thumb')].entries()) {
    t.setAttribute('aria-current', String(n === current));
  }
}

export function openSheet(pin, onTry) {
  const model = MODELS.find((m) => m.id === pin.model);
  const el = sheet();
  photos = pin.photos?.length ? pin.photos : [pin];
  el.querySelector('.sheet-model').textContent = model?.name ?? '';
  el.querySelector('.sheet-place').textContent = pin.place;

  const multi = photos.length > 1;
  for (const b of el.querySelectorAll('.sheet-nav, .sheet-count, .sheet-thumbs')) b.hidden = !multi;
  const thumbs = el.querySelector('.sheet-thumbs');
  thumbs.innerHTML = '';
  photos.forEach((p, n) => {
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'sheet-thumb';
    t.setAttribute('aria-label', `${n + 1}번째 사진`);
    t.innerHTML = `<img src="${p.photo.replace("assets/photos/", "assets/thumbs/")}" alt="" loading="lazy">`;
    t.addEventListener('click', () => showPhoto(n));
    thumbs.append(t);
  });
  showPhoto(0);

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
  sheet().querySelector('.sheet-prev').addEventListener('click', () => showPhoto(current - 1));
  sheet().querySelector('.sheet-next').addEventListener('click', () => showPhoto(current + 1));
  // 사진 위에서 좌우로 밀어도 넘어간다
  let startX = null;
  const wrap = sheet().querySelector('.sheet-photo-wrap');
  wrap.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  wrap.addEventListener('touchend', (e) => {
    if (startX === null || photos.length < 2) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) showPhoto(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
}
