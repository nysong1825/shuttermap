// 앱 첫 화면: 스플래시(1~2초) → 1/2 카메라 취향 → 2/2 추가 정보 → 완료.
// 완료하면 onComplete(profile)을 부른다. 지도 화면 진입은 호출하는 쪽(main.js)이 맡는다.

const SPLASH_MS = 1800;
const YEAR_MIN = 1960;
const YEAR_MAX = 2015;

export function initOnboarding(root, { onComplete }) {
  const splash = root.querySelector('.onb-splash');
  const steps = [...root.querySelectorAll('.onb-step')];
  const picks = {}; // group -> value
  const next = root.querySelector('.onb-next');
  const done = root.querySelector('.onb-done');
  const year = root.querySelector('#onb-year');

  year.append(new Option('선택', ''));
  for (let y = YEAR_MAX; y >= YEAR_MIN; y--) year.append(new Option(`${y}년`, String(y)));

  function show(n) {
    splash.hidden = true;
    for (const s of steps) s.hidden = Number(s.dataset.step) !== n;
  }

  function refresh() {
    next.disabled = !(picks.design && picks.look && picks.price);
    done.disabled = !(picks.gender && year.value);
  }

  // 그룹마다 1개만 선택. 같은 걸 다시 누르면 해제.
  for (const group of root.querySelectorAll('fieldset.onb-group')) {
    const name = group.dataset.group;
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('.onb-opt');
      if (!btn) return;
      const wasOn = btn.getAttribute('aria-pressed') === 'true';
      for (const b of group.querySelectorAll('.onb-opt')) b.setAttribute('aria-pressed', 'false');
      if (wasOn) delete picks[name];
      else {
        btn.setAttribute('aria-pressed', 'true');
        picks[name] = btn.dataset.value;
      }
      refresh();
    });
  }
  year.addEventListener('change', refresh);

  next.addEventListener('click', () => show(2));
  root.querySelector('.onb-back').addEventListener('click', () => show(1));
  done.addEventListener('click', () => {
    onComplete({ ...picks, birthYear: Number(year.value) });
  });

  setTimeout(() => show(1), SPLASH_MS);
  refresh();
}
