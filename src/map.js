import { MODELS } from './data/models.js';

const MODEL_BY_ID = new Map(MODELS.map((m) => [m.id, m]));

// 지도 범위: 인천~서울~광명. 작례가 없는 지역까지 볼 필요가 없어 이 밖으로는 이동·축소를 막는다.
const REGION = [[37.40, 126.58], [37.66, 127.16]];
const MAX_ZOOM = 15; // 동네 단위까지만 확대

// 핀 아이콘 표시 너비(px). 모델마다 사진 비율이 달라서, 본체가 클래식 디카와 비슷한 크기로 보이도록 맞춘다.
const ICON_WIDTH = { classic: 96, millennium: 96, western: 96, neo: 96, 'retro-digi': 96, flip270: 96, flip: 88, 'retro-flip': 80 };

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
  // 벡터 타일(OpenFreeMap Positron): 회색조 미니멀이라 컬러 카메라 핀이 돋보인다.
  L.maplibreGL({
    style: 'https://tiles.openfreemap.org/styles/positron',
    attribution: '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(map);

  // 핀 = 해당 작례를 찍은 카메라 디자인 + 이름
  // 같은 장소·같은 카메라는 핀 하나로 묶고, 사진은 시트에서 넘겨 본다
  const groups = new Map();
  for (const pin of pins) {
    const key = `${pin.place}|${pin.model}`;
    if (!groups.has(key)) groups.set(key, { ...pin, photos: [] });
    groups.get(key).photos.push(pin);
  }
  const markers = [...groups.values()].map((pin) => {
    const model = MODEL_BY_ID.get(pin.model);
    const icon = L.divIcon({
      className: 'pin cam-pin',
      html: `<img src="${model.icon}" alt="" style="width:${ICON_WIDTH[model.id] ?? 96}px"><span class="cam-name">${model.name}</span>`,
      iconSize: [104, 112],
      iconAnchor: [52, 46],
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
        iconSize: [120, 80],
        iconAnchor: [60, 40],
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
