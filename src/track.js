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

export function track(name, params = {}) {
  console.info(name, params);
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
}
