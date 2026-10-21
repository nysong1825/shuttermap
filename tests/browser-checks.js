// 브라우저에서만 확인 가능한 리뷰 수정 검사. 개발 서버 페이지 콘솔(또는 자동화 도구)에서 실행한다.
// 반환값의 모든 항목이 true여야 통과.
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;left:0;top:0;width:390px;height:780px;border:0;z-index:99999';
  frame.src = '/?check=' + Date.now();
  document.body.append(frame);
  await new Promise((r) => (frame.onload = r));
  await sleep(1200);
  const w = frame.contentWindow;
  const d = frame.contentDocument;
  const out = {};

  // I1: 기본 줌에서 같은 동네(성수동 2장)는 하나의 묶음 아이콘으로 보인다
  const { PINS } = await import('/src/data/pins.js');
  out.clusterAtDefaultZoom = !!d.querySelector('.marker-cluster') && d.querySelectorAll('.pin').length < PINS.length;

  // 핀은 사진이 아니라 카메라 디자인 + 모델 이름
  out.pinIsCameraWithName = [...d.querySelectorAll('.pin')].every((p) => /assets\/cameras\//.test(p.querySelector('img')?.src ?? ''))
    && d.querySelectorAll('.pin').length > 0;

  // I5: OSM 저작권 표기
  out.osmAttribution = /OpenStreetMap contributors/.test(d.querySelector('.leaflet-control-attribution')?.textContent ?? '');

  // 공통: 사진 넣기 도우미
  const input = d.querySelector('.convert-input');
  const feed = (file) => { const dt = new w.DataTransfer(); dt.items.add(file); input.files = dt.files; input.dispatchEvent(new w.Event('change')); };
  const jpeg = await new Promise((r) => { const c = d.createElement('canvas'); c.width = 600; c.height = 400; c.getContext('2d').fillRect(0, 0, 600, 400); c.toBlob(r, 'image/jpeg'); });

  // I3 + I4: createImageBitmap 없는 구형 iOS + type 빈 JPG도 정상 로드
  const saved = w.createImageBitmap;
  w.createImageBitmap = undefined;
  feed(new w.File([jpeg], 'IMG_0001.JPG', { type: '' }));
  await sleep(800);
  w.createImageBitmap = saved;
  out.oldIosEmptyTypeLoads = d.querySelector('.convert-error').hidden && !!d.querySelector('.compare-filtered');

  // I6: 칩 전환 시 이전 필터 캔버스 메모리 해제(width 0)
  const before = d.querySelector('.compare-filtered');
  d.querySelectorAll('.convert-chips .chip')[1]?.click();
  await sleep(300);
  out.oldCanvasReleased = !!before && before.width === 0;

  // I2: 인앱 브라우저 저장 오버레이는 data: JPEG
  Object.defineProperty(w.navigator, 'userAgent', { get: () => 'Mozilla/5.0 (Linux; Android 14) Instagram 300.0', configurable: true });
  d.querySelector('.convert-save').click();
  await sleep(600);
  out.overlayIsDataJpeg = (d.querySelector('.save-overlay img').src ?? '').startsWith('data:image/jpeg');

  frame.remove();
  return out;
})();
