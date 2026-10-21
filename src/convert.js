import { MODELS, buildProductUrl } from './data/models.js';
import { applyFilter } from './filters.js';
import { loadImageToCanvas } from './imageLoad.js';

const NOISE_SEED = 7;

function isSaveBlocked() {
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const inApp = /Instagram|FBAN|FBAV|KAKAOTALK|NAVER|Line\//i.test(ua);
  return iOS || inApp;
}

// 실제 휴그 디카 각인처럼 좌하단에 "YYYY/MM/DD HH:MM:SS"
const STAMP_COLORS = { yellow: '#ffd21f', white: '#f4f4f4' };

function drawDateStamp(canvas, color) {
  const ctx = canvas.getContext('2d');
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  const text = `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  const size = Math.max(12, Math.round(canvas.width * (color === 'yellow' ? 0.04 : 0.022)));
  ctx.font = `bold ${size}px "Courier New", monospace`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = size * 0.2;
  ctx.fillStyle = STAMP_COLORS[color];
  ctx.fillText(text, size * 0.6, canvas.height - size * 0.5);
}

function renderFiltered(source, model) {
  const out = document.createElement('canvas');
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext('2d');
  ctx.drawImage(source, 0, 0);
  const img = ctx.getImageData(0, 0, out.width, out.height);
  applyFilter(img.data, out.width, out.height, model.filter, NOISE_SEED);
  ctx.putImageData(img, 0, 0);
  if (model.filter.dateStamp) drawDateStamp(out, model.filter.dateStamp);
  return out;
}

export function initConvert(root, { onConvert = () => {}, onProductClick = () => {} } = {}) {
  const input = root.querySelector('.convert-input');
  const error = root.querySelector('.convert-error');
  const empty = root.querySelector('.convert-empty');
  const result = root.querySelector('.convert-result');
  const chips = root.querySelector('.convert-chips');
  const compare = root.querySelector('.compare');
  const toggle = root.querySelector('.original-toggle');
  const label = root.querySelector('.compare-label');
  const productLink = root.querySelector('.convert-product');
  const saveBtn = root.querySelector('.convert-save');
  const overlay = root.querySelector('.save-overlay');

  let source = null;
  let filtered = null;
  let modelId = MODELS[0].id;

  function currentModel() {
    return MODELS.find((m) => m.id === modelId) ?? MODELS[0];
  }

  function syncChips() {
    for (const b of chips.children) b.setAttribute('aria-pressed', String(b.dataset.model === modelId));
    const model = currentModel();
    productLink.textContent = `이 느낌 → ${model.name} 보기`;
    productLink.href = buildProductUrl(model, 'convert');
  }

  function render() {
    syncChips();
    if (!source) return;
    if (filtered) filtered.width = 0; // iOS 캔버스 메모리 한도 대비: 이전 결과 즉시 해제
    filtered = renderFiltered(source, currentModel());
    filtered.className = 'compare-filtered';
    source.className = 'compare-original';
    compare.querySelectorAll('canvas').forEach((c) => c.remove());
    compare.prepend(source, filtered);
    onConvert(modelId);
  }

  for (const m of MODELS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.model = m.id;
    b.textContent = m.name;
    b.addEventListener('click', () => { modelId = m.id; render(); });
    chips.append(b);
  }

  input.addEventListener('change', async () => {
    const file = input.files[0];
    input.value = '';
    if (!file) return;
    error.hidden = true;
    try {
      source = await loadImageToCanvas(file);
    } catch {
      error.hidden = false;
      return;
    }
    empty.hidden = true;
    result.hidden = false;
    setOriginal(false);
    render();
  });

  // 기본은 필터 적용 사진. [원본]을 누르면 원본, 다시 누르면 필터 사진으로 돌아간다.
  function setOriginal(on) {
    compare.classList.toggle('show-original', on);
    toggle.setAttribute('aria-pressed', String(on));
    label.textContent = on ? '원본' : '필터 적용';
  }
  toggle.addEventListener('click', () => setOriginal(toggle.getAttribute('aria-pressed') !== 'true'));

  productLink.addEventListener('click', () => onProductClick(modelId));

  saveBtn.addEventListener('click', () => {
    if (!filtered) return;
    // data: URL — 안드로이드 인앱 브라우저의 길게 눌러 저장은 blob: URL을 못 받는 경우가 많다
    const url = filtered.toDataURL('image/jpeg', 0.9);
    if (isSaveBlocked()) {
      overlay.querySelector('img').src = url;
      overlay.hidden = false;
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = `shuttermap_${modelId}.jpg`;
    a.click();
  });

  overlay.querySelector('.save-overlay-close').addEventListener('click', () => {
    overlay.querySelector('img').removeAttribute('src');
    overlay.hidden = true;
  });

  syncChips();

  return {
    selectModel(id) {
      if (!MODELS.some((m) => m.id === id)) return;
      modelId = id;
      render();
    },
  };
}
