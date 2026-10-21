import { FALLBACK_PHOTO } from './sheet.js';

const SEOUL = [37.5445, 127.0];

export function initMap(el, pins, onPinSelect) {
  const map = L.map(el, { zoomControl: false }).setView(SEOUL, 12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  }).addTo(map);

  const markers = pins.map((pin) => {
    const icon = L.divIcon({
      className: 'pin',
      html: `<img src="${pin.photo}" alt="" onerror="this.onerror=null;this.src='${FALLBACK_PHOTO}'">`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
    const marker = L.marker([pin.lat, pin.lng], { icon, title: `${pin.place} 작례`, photo: pin.photo });
    marker.on('click', () => onPinSelect(pin));
    return { pin, marker };
  });

  // 가까운 핀은 첫 사진 + 장수 배지로 묶고, 누르면 확대(최대 줌에서는 펼침)
  const layer = L.markerClusterGroup({
    maxClusterRadius: 48,
    showCoverageOnHover: false,
    iconCreateFunction(cluster) {
      const first = cluster.getAllChildMarkers()[0];
      const photo = first.options.photo;
      return L.divIcon({
        className: 'pin marker-cluster',
        html: `<img src="${photo}" alt="" onerror="this.onerror=null;this.src='${FALLBACK_PHOTO}'"><span class="pin-count">${cluster.getChildCount()}</span>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
    },
  });
  layer.addLayers(markers.map((m) => m.marker));
  map.addLayer(layer);

  return {
    setModelFilter(modelId) {
      layer.clearLayers();
      layer.addLayers(markers.filter(({ pin }) => modelId === 'all' || pin.model === modelId).map((m) => m.marker));
    },
    invalidate() {
      map.invalidateSize();
    },
  };
}

export function renderModelChips(container, models, onChange) {
  const options = [{ id: 'all', name: '전체' }, ...models];
  container.innerHTML = '';
  for (const opt of options) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.textContent = opt.name;
    btn.setAttribute('aria-pressed', String(opt.id === 'all'));
    btn.addEventListener('click', () => {
      for (const b of container.children) b.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-pressed', 'true');
      onChange(opt.id);
    });
    container.append(btn);
  }
}
