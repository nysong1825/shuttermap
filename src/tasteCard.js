// '내 취향' 칩을 눌렀을 때 지도 아래에 뜨는 카드: 가장 잘 맞는 카메라 1대 + 제품 보기.
import { buildProductUrl } from './data/models.js';
import { matchedLabels } from './taste.js';

export function initTasteCard(el, { onProductClick }) {
  const img = el.querySelector('.taste-card-img');
  const name = el.querySelector('.taste-card-name');
  const match = el.querySelector('.taste-card-match');
  const link = el.querySelector('.taste-card-link');
  let top = null;

  link.addEventListener('click', () => top && onProductClick(top.id));

  return {
    // top: 가장 잘 맞는 모델(없으면 null), profile: 온보딩에서 고른 취향
    setTop(model, profile) {
      top = model;
      if (!model) return;
      const labels = matchedLabels(model, profile);
      img.src = model.icon;
      name.textContent = model.name;
      match.textContent = `취향 ${labels.length}/3 · ${labels.join(' · ')}`;
      link.href = buildProductUrl(model, 'taste_top');
    },
    show(visible) {
      el.hidden = !visible || !top;
    },
  };
}
