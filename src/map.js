import { FALLBACK_PHOTO } from './sheet.js';

const SEOUL = [37.5445, 127.0];

export function initMap(el, pins, onPinSelect) {
  const map = L.map(el, { zoomControl: false }).setView(SEOUL, 12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  }).addTo(map);

  const markers = pins.map((pin) => {
    const icon = L.divIcon({
      className: 'pin',
      html: `<img src="${pin.photo}" alt="" onerror="this.onerror=null;this.src='${FALLBACK_PHOTO}'">`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
    const marker = L.marker([pin.lat, pin.lng], { icon, title: `${pin.place} 작례` });
    marker.on('click', () => onPinSelect(pin));
    return { pin, marker };
  });

  const layer = L.layerGroup(markers.map((m) => m.marker)).addTo(map);

  return {
    setModelFilter(modelId) {
      layer.clearLayers();
      for (const { pin, marker } of markers) {
        if (modelId === 'all' || pin.model === modelId) layer.addLayer(marker);
      }
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
