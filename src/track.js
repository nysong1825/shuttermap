import { logToSheet } from './sheetLog.js';

// 측정 연결점. GA4(gtag)가 붙어 있으면 이벤트로 보내고, 없으면 콘솔에만 남긴다.

export function initAnalytics(measurementId) {
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.append(s);
}

// 구글 시트(폼)에도 한 줄씩 쌓는 이벤트: 취향 선택 완료 · 사고 싶어요 · 제품 보기 클릭
const SHEET_EVENTS = new Set(['onboarding_complete', 'want_to_buy', 'product_click']);

export function track(name, params = {}) {
  console.info(name, params);
  if (SHEET_EVENTS.has(name)) logToSheet(name, params);
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
}

// GA4 사용자 속성: 한 번 정해 두면 이후 모든 이벤트(핀 열기·제품 클릭·사고 싶어요 등)를 취향별로 나눠 볼 수 있다.
export function setUserProps(props) {
  if (typeof window.gtag === 'function') window.gtag('set', 'user_properties', props);
}
