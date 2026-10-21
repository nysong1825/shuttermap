import { MODELS } from './data/models.js';

const MODEL_BY_ID = new Map(MODELS.map((m) => [m.id, m]));

// 지도 범위: 인천~서울~광명. 작례가 없는 지역까지 볼 필요가 없어 이 밖으로는 이동·축소를 막는다.
const REGION = [[37.40, 126.58], [37.66, 127.16]];
const MAX_ZOOM = 15; // 동네 단위까지만 확대

export function initMap(el, pins, onPinSelect) {
  const region = L.latLngBounds(REGION);
  const map = L.map(el, {
    zoomControl: false,
    maxZoom: MAX_ZOOM,
    maxBounds: region.pad(0.05),
    maxBoundsViscosity: 1,
  });
  map.fitBounds(region);
  map.setMinZoom(map.getZoom());
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: MAX_ZOOM,
    className: 'map-tiles',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  }).addTo(map);

  // 핀 = 해당 작례를 찍은 카메라 디자인 + 이름
  const markers = pins.map((pin) => {
    const model = MODEL_BY_ID.get(pin.model);
    const icon = L.divIcon({
      className: 'pin cam-pin',
      html: `<img src="${model.icon}" alt=""><span class="cam-name">${model.name}</span>`,
      iconSize: [64, 56],
      iconAnchor: [32, 28],
    });
    const marker = L.marker([pin.lat, pin.lng], { icon, title: `${model.name} · ${pin.place}`, model: pin.model });
    marker.on('click', () => onPinSelect(pin));
    return { pin, marker };
  });

  // 가까운 핀은 카메라 디자인(최대 3종)을 겹쳐 보여주고 장수 배지로 묶는다. 누르면 확대, 최대 줌에서는 펼쳐져 이름까지 보인다.
  const layer = L.markerClusterGroup({
    maxClusterRadius: 56,
    showCoverageOnHover: false,
    iconCreateFunction(cluster) {
      const ids = [...new Set(cluster.getAllChildMarkers().map((m) => m.options.model))].slice(0, 3);
      const imgs = ids.map((id) => `<img src="${MODEL_BY_ID.get(id).icon}" alt="">`).join('');
      return L.divIcon({
        className: 'pin cam-cluster marker-cluster',
        html: `<span class="cam-stack n${ids.length}">${imgs}</span><span class="pin-count">${cluster.getChildCount()}</span>`,
        iconSize: [72, 56],
        iconAnchor: [36, 28],
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
