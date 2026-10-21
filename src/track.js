// 측정 연결점. GA4(gtag)가 페이지에 붙어 있으면 이벤트로 보내고, 없으면 콘솔에만 남긴다.

export function track(name, params = {}) {
  console.info(name, params);
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
}
