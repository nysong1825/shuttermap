// 앱 첫 화면: 스플래시(1~2초) → 1/2 카메라 취향 → 2/2 추가 정보 → 완료.
// 완료하면 onComplete(profile)을 부른다. 지도 화면 진입은 호출하는 쪽(main.js)이 맡는다.
// hasProfile이면 스플래시 뒤에 취향 선택 대신 onSkip()을 부르고, reopen(profile)으로 취향을 다시 고르게 열 수 있다.

const SPLASH_MS = 1000;
const YEAR_MIN = 1960;
const YEAR_MAX = 2015;

export function initOnboarding(root, { onComplete, hasProfile = false, onSkip, onFirstStep }) {
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

  function setPick(name, value) {
    const group = root.querySelector(`fieldset[data-group="${name}"]`);
    for (const b of group.querySelectorAll('.onb-opt')) {
      b.setAttribute('aria-pressed', String(b.dataset.value === value));
    }
    picks[name] = value;
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

  setTimeout(() => {
    if (hasProfile) { onSkip(); return; }
    show(1);
    onFirstStep?.(); // 취향 선택 화면이 뜬 뒤에 셔터맵 소개 알럿을 띄운다
  }, SPLASH_MS);
  refresh();

  return {
    // 저장된 취향을 채운 채로 1/2부터 다시 연다.
    reopen(profile) {
      for (const k of ['design', 'look', 'price', 'gender']) setPick(k, profile[k]);
      year.value = String(profile.birthYear);
      refresh();
      root.hidden = false;
      show(1);
    },
  };
}
