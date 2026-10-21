import { MODELS } from './data/models.js';
import { applyFilter } from './filters.js';
import { loadImageToCanvas } from './imageLoad.js';

const NOISE_SEED = 7;

function isSaveBlocked() {
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const inApp = /Instagram|FBAN|FBAV|KAKAOTALK|NAVER|Line\//i.test(ua);
  return iOS || inApp;
}

function drawDateStamp(canvas) {
  const ctx = canvas.getContext('2d');
  const d = new Date();
  const text = `'${String(d.getFullYear()).slice(2)} ${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getDate()).padStart(2, '0')}`;
  const size = Math.max(14, Math.round(canvas.width * 0.045));
  ctx.font = `bold ${size}px "Courier New", monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.shadowColor = 'rgba(255, 120, 0, 0.8)';
  ctx.shadowBlur = size * 0.4;
  ctx.fillStyle = '#ffb000';
  ctx.fillText(text, canvas.width - size, canvas.height - size * 0.8);
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
  if (model.filter.dateStamp) drawDateStamp(out);
  return out;
}

export function initConvert(root, { onConvert = () => {}, onProductClick = () => {} } = {}) {
  const input = root.querySelector('.convert-input');
  const error = root.querySelector('.convert-error');
  const empty = root.querySelector('.convert-empty');
  const result = root.querySelector('.convert-result');
  const chips = root.querySelector('.convert-chips');
  const compare = root.querySelector('.compare');
  const slider = root.querySelector('.compare-slider');
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
    productLink.href = model.productUrl;
  }

  function render() {
    syncChips();
    if (!source) return;
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
    render();
  });

  slider.addEventListener('input', () => {
    compare.style.setProperty('--pos', `${slider.value}%`);
  });

  productLink.addEventListener('click', () => onProductClick(modelId));

  saveBtn.addEventListener('click', () => {
    if (!filtered) return;
    filtered.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      if (isSaveBlocked()) {
        overlay.querySelector('img').src = url;
        overlay.hidden = false;
        return;
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = `shuttermap_${modelId}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  });

  overlay.querySelector('.save-overlay-close').addEventListener('click', () => {
    URL.revokeObjectURL(overlay.querySelector('img').src);
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
