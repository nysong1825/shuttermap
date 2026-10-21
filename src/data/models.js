// 휴그 카메라 모델 목록. name은 작례 사진 폴더 이름과 같아야 한다(scripts/build-pins.mjs가 폴더명으로 매칭).
// filter 값은 초기 추정치 — 실제 작례를 보고 Task 7에서 조정한다.
// productUrl은 임시값 — 실제 상품 URL로 교체 필요.

export const MODELS = [
  {
    id: 'retro-flip',
    name: '레트로 플립 디카',
    productUrl: 'https://huug.kr/',
    filter: { brightness: 1.05, contrast: 0.92, saturation: 0.9, warmth: 0.35, noise: 0.35, vignette: 0.5, dateStamp: true },
  },
  {
    id: 'flip',
    name: '플립 디카',
    productUrl: 'https://huug.kr/',
    filter: { brightness: 1.08, contrast: 1.0, saturation: 1.05, warmth: 0.15, noise: 0.25, vignette: 0.3, dateStamp: true },
  },
  {
    id: 'retro-digi',
    name: '레트로 디카',
    productUrl: 'https://huug.kr/',
    filter: { brightness: 1.0, contrast: 1.1, saturation: 1.2, warmth: 0.2, noise: 0.3, vignette: 0.4, dateStamp: true },
  },
  {
    id: 'retro-clear',
    name: '레트로 클리어',
    productUrl: 'https://huug.kr/',
    filter: { brightness: 1.1, contrast: 0.95, saturation: 0.85, warmth: -0.1, noise: 0.2, vignette: 0.25, dateStamp: false },
  },
  {
    id: 'classic',
    name: '클래식 디카',
    productUrl: 'https://huug.kr/',
    filter: { brightness: 1.0, contrast: 0.9, saturation: 0.8, warmth: 0.25, noise: 0.15, vignette: 0.35, dateStamp: false },
  },
];
