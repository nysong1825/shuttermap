// 휴그 카메라 모델 목록. name은 작례 사진 폴더 이름과 같아야 한다(scripts/build-pins.mjs가 폴더명으로 매칭).
// filter 값: 작례 사진 통계(밝기·대비·채도·색 치우침)와 플립 디카 '같은 장면 비교 4쌍'으로 맞춘 값(10/21 점검, docs/필터점검_20261021.md).
// tags: 시트에 #해시태그로 보여줄 카메라 특징 3개.
// taste: 온보딩 취향 선택지와 같은 단어(디자인·색감느낌·가격대). 가격대는 판매가 기준 — 가성비 2~3만원대, 고기능 4~6만원대.
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
    taste: { design: '클래식', look: '레트로', price: '고기능' },
    icon: 'assets/cameras/classic.png',
    name: '클래식 디카',
    tags: ['클래식함', '레트로색감', '입문용추천'],
    productUrl: 'https://huug.kr/product/%ED%81%B4%EB%9E%98%EC%8B%9D-%EB%94%94%EC%A7%80%ED%84%B8-%EC%B9%B4%EB%A9%94%EB%9D%BC/116/category/71/display/1/',
    filter: { brightness: 0.93, contrast: 1.29, saturation: 0.71, warmth: -0.02, noise: 0.15, vignette: 0.08, dateStamp: 'white' },
  },
  {
    id: 'flip270',
    taste: { design: '메탈릭', look: '쨍한색감', price: '고기능' },
    icon: 'assets/cameras/flip270.png',
    name: '플립 270 캠코더',
    tags: ['화면플립', '필름감성', '옛날뮤비ST'],
    productUrl: 'https://huug.kr/product/%ED%94%8C%EB%A6%BD-270-%EC%BA%A0%EC%BD%94%EB%8D%94/113/category/71/display/1/',
    filter: { brightness: 1.19, contrast: 1.2, saturation: 0.95, warmth: -0.07, noise: 0.29, vignette: 0, dateStamp: null },
  },
  {
    id: 'millennium',
    taste: { design: '메탈릭', look: '선명함', price: '고기능' },
    icon: 'assets/cameras/millennium.png',
    name: '밀레니엄 디카',
    tags: ['아날로그', '또렷한레트로', '감성사진'],
    productUrl: 'https://huug.kr/product/%EB%B0%80%EB%A0%88%EB%8B%88%EC%97%84-%EB%94%94%EC%A7%80%ED%84%B8-%EC%B9%B4%EB%A9%94%EB%9D%BC/112/category/71/display/1/',
    filter: { brightness: 1.07, contrast: 1.39, saturation: 0.85, warmth: -0.03, noise: 0.24, vignette: 0, dateStamp: 'white' },
  },
  {
    id: 'western',
    taste: { design: '클래식', look: '레트로', price: '가성비' },
    icon: 'assets/cameras/western.png',
    name: '웨스턴 디카',
    tags: ['빈티지감성', '따뜻한감성', '웨스턴ST'],
    productUrl: 'https://huug.kr/product/%EC%9B%A8%EC%8A%A4%ED%84%B4-%EB%94%94%EC%A7%80%ED%84%B8-%EC%B9%B4%EB%A9%94%EB%9D%BC/111/category/71/display/1/',
    filter: { brightness: 0.98, contrast: 1.43, saturation: 0.67, warmth: 0.12, noise: 0.45, vignette: 0, dateStamp: 'white' },
  },
  {
    id: 'retro-digi',
    taste: { design: '귀여움', look: '레트로', price: '가성비' },
    icon: 'assets/cameras/retro-digi.png',
    name: '레트로 디카',
    tags: ['레트로색감', '옛날그감성', '일상기록'],
    productUrl: 'https://huug.kr/product/%EB%A0%88%ED%8A%B8%EB%A1%9C-%EB%94%94%EC%A7%80%ED%84%B8-%EC%B9%B4%EB%A9%94%EB%9D%BC-%ED%81%B4%EB%A6%AC%EC%96%B4/95/category/71/display/1/',
    filter: { brightness: 1.09, contrast: 1.44, saturation: 0.66, warmth: 0.01, noise: 0.11, vignette: 0, dateStamp: 'white' },
  },
  {
    id: 'neo',
    taste: { design: '귀여움', look: '쨍한색감', price: '가성비' },
    icon: 'assets/cameras/neo.png',
    name: '네오 디카',
    tags: ['빈티지감성', '쨍한색감', '일상기록'],
    productUrl: 'https://huug.kr/product/%EB%84%A4%EC%98%A4-%EB%94%94%EC%A7%80%ED%84%B8-%EC%B9%B4%EB%A9%94%EB%9D%BC/93/category/71/display/1/',
    filter: { brightness: 1.11, contrast: 1.36, saturation: 0.7, warmth: -0.12, noise: 0.45, vignette: 0, dateStamp: 'yellow' },
  },
  {
    id: 'flip',
    taste: { design: '귀여움', look: '레트로', price: '가성비' },
    icon: 'assets/cameras/flip.png',
    name: '플립 디카',
    tags: ['화면플립', '16배확대', '레트로색감'],
    productUrl: FLIP_URL,
    filter: { brightness: 1.08, contrast: 1.32, saturation: 0.95, warmth: -0.02, noise: 0.14, vignette: 0, dateStamp: 'white' },
  },
  {
    id: 'retro-flip',
    taste: { design: '메탈릭', look: '레트로', price: '가성비' },
    icon: 'assets/cameras/retro-flip.png',
    name: '레트로 플립 디카',
    tags: ['화면플립', '메탈감성', '레트로색감'],
    productUrl: FLIP_URL,
    filter: { brightness: 1.06, contrast: 1.06, saturation: 1.03, warmth: -0.02, noise: 0.28, vignette: 0, dateStamp: 'white' },
  },
];
