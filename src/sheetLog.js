// 셔터맵 클릭 로그 -> 구글 스프레드시트 자동 적재 모듈
// 용도: 버튼을 누를 때마다 구글 폼(formResponse)에 값을 POST하면 폼과 연결된 시트에 한 줄씩 쌓임.
// 폼 편집: https://docs.google.com/forms/d/17yXQcv3mLuDHXXNsjzvm-VM19Imvlo5E0XaVDcyCtiE/edit
// 폼 공개: https://docs.google.com/forms/d/e/1FAIpQLSc1GdzhXVQKcjqniFhOeRKjz-FXr2ny6FPQyy0SpM5cvk0YNA/viewform
// 응답 시트: https://docs.google.com/spreadsheets/d/1Z3PBMSAcqfinkdYgDZrR3ZzWg4u2Cpi709t-paCAnKg/edit
// 주의: 개인 식별 정보(이름·연락처·이메일)는 절대 보내지 않음. 실패해도 앱은 계속 동작(조용히 무시).

const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSc1GdzhXVQKcjqniFhOeRKjz-FXr2ny6FPQyy0SpM5cvk0YNA/formResponse';

// 질문 이름 -> entry ID
const ENTRY = {
  event: 'entry.1221184979',
  model: 'entry.528443823',
  from: 'entry.1622301117',
  place: 'entry.270549822',
  taste_design: 'entry.1777318734',
  taste_look: 'entry.539393665',
  taste_price: 'entry.1976350841',
  gender: 'entry.1173242800',
  age_group: 'entry.1478791981',
  top_model: 'entry.2103949971',
  age_birth: 'entry.2092351866', // 예비
};

const PARAM_KEYS = [
  'model', 'from', 'place',
  'taste_design', 'taste_look', 'taste_price',
  'gender', 'age_group', 'top_model',
];

export function logToSheet(eventName, params = {}) {
  try {
    const body = new URLSearchParams();
    body.set(ENTRY.event, String(eventName ?? ''));
    for (const k of PARAM_KEYS) {
      const v = params ? params[k] : undefined;
      body.set(ENTRY[k], v == null ? '' : String(v));
    }
    fetch(FORM_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      keepalive: true,
    }).catch((e) => console.warn('[sheetLog] 전송 실패', e));
  } catch (e) {
    console.warn('[sheetLog] 오류', e);
  }
}
