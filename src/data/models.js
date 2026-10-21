// 휴그 카메라 모델 목록. name은 작례 사진 폴더 이름과 같아야 한다(scripts/build-pins.mjs가 폴더명으로 매칭).
// filter 값은 작례 썸네일을 보고 잡은 초기값 — 나영 확인 후 조정.
// dateStamp: 실제 카메라 날짜 각인 색 ('yellow' | 'white'), 각인이 없는 모델은 null.

const UTM = {
  utm_source: 'shuttermap',
  utm_medium: 'app',
  utm_campaign: 'ax_hackathon_202610',
};

export function buildProductUrl(model, from) {
  const params = new URLSearchParams({ ...UTM, utm_content: `${model.id}_${from}` });
  const sep = model.productUrl.includes('?') ? '&' : '?';
  return `${model.productUrl}${sep}${params}`;
}

const FLIP_URL = 'https://huug.kr/product/filp-digital-camera-2-colors/101/';

export const MODELS = [
  {
    id: 'classic',
    icon: 'assets/cameras/classic.png',
    name: '클래식 디카',
    productUrl: 'https://huug.kr/product/%ED%81%B4%EB%9E%98%EC%8B%9D-%EB%94%94%EC%A7%80%ED%84%B8-%EC%B9%B4%EB%A9%94%EB%9D%BC/116/category/71/display/1/',
    filter: { brightness: 0.97, contrast: 1.0, saturation: 0.95, warmth: 0.05, noise: 0.2, vignette: 0.25, dateStamp: 'white' },
  },
  {
    id: 'flip270',
    icon: 'assets/cameras/flip270.png',
    name: '플립 270 캠코더',
    productUrl: 'https://huug.kr/product/%ED%94%8C%EB%A6%BD-270-%EC%BA%A0%EC%BD%94%EB%8D%94/113/category/71/display/1/',
    filter: { brightness: 1.2, contrast: 1.1, saturation: 1.3, warmth: -0.05, noise: 0.1, vignette: 0, dateStamp: null },
  },
  {
    id: 'millennium',
    icon: 'assets/cameras/millennium.png',
    name: '밀레니엄 디카',
    productUrl: 'https://huug.kr/product/%EB%B0%80%EB%A0%88%EB%8B%88%EC%97%84-%EB%94%94%EC%A7%80%ED%84%B8-%EC%B9%B4%EB%A9%94%EB%9D%BC/112/category/71/display/1/',
    filter: { brightness: 1.05, contrast: 1.15, saturation: 1.2, warmth: 0, noise: 0.15, vignette: 0.1, dateStamp: 'white' },
  },
  {
    id: 'western',
    icon: 'assets/cameras/western.png',
    name: '웨스턴 디카',
    productUrl: 'https://huug.kr/product/%EC%9B%A8%EC%8A%A4%ED%84%B4-%EB%94%94%EC%A7%80%ED%84%B8-%EC%B9%B4%EB%A9%94%EB%9D%BC/111/category/71/display/1/',
    filter: { brightness: 1.1, contrast: 0.85, saturation: 0.8, warmth: 0.15, noise: 0.2, vignette: 0.3, dateStamp: 'white' },
  },
  {
    id: 'retro-digi',
    icon: 'assets/cameras/retro-digi.png',
    name: '레트로 디카',
    productUrl: 'https://huug.kr/product/%EB%A0%88%ED%8A%B8%EB%A1%9C-%EB%94%94%EC%A7%80%ED%84%B8-%EC%B9%B4%EB%A9%94%EB%9D%BC-%ED%81%B4%EB%A6%AC%EC%96%B4/95/category/71/display/1/',
    filter: { brightness: 1.0, contrast: 0.95, saturation: 0.9, warmth: 0.25, noise: 0.2, vignette: 0.3, dateStamp: 'white' },
  },
  {
    id: 'neo',
    icon: 'assets/cameras/neo.png',
    name: '네오 디카',
    productUrl: 'https://huug.kr/product/%EB%84%A4%EC%98%A4-%EB%94%94%EC%A7%80%ED%84%B8-%EC%B9%B4%EB%A9%94%EB%9D%BC/93/category/71/display/1/',
    filter: { brightness: 1.05, contrast: 1.25, saturation: 1.35, warmth: 0.05, noise: 0.3, vignette: 0.2, dateStamp: 'yellow' },
  },
  {
    id: 'flip',
    icon: 'assets/cameras/flip.png',
    name: '플립 디카',
    productUrl: FLIP_URL,
    filter: { brightness: 1.0, contrast: 1.15, saturation: 1.25, warmth: -0.1, noise: 0.25, vignette: 0.2, dateStamp: 'white' },
  },
  {
    id: 'retro-flip',
    icon: 'assets/cameras/retro-flip.png',
    name: '레트로 플립 디카',
    productUrl: FLIP_URL,
    filter: { brightness: 1.05, contrast: 0.85, saturation: 0.85, warmth: -0.35, noise: 0.25, vignette: 0.25, dateStamp: 'white' },
  },
];
