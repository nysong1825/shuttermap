// 온보딩에서 고른 취향(디자인·색감느낌·가격대)과 카메라의 taste가 몇 개 일치하는지로 추천 카메라를 고른다.

const KEYS = ['design', 'look', 'price'];
export const MIN_MATCH = 2; // 3개 중 2개 이상 일치하면 표시

export function tasteScore(model, profile) {
  return KEYS.filter((k) => profile[k] && model.taste?.[k] === profile[k]).length;
}

// 일치 개수가 많은 순(같으면 MODELS 순서)으로 [{ id, score }]
export function matchModels(models, profile) {
  return models
    .map((m) => ({ id: m.id, score: tasteScore(m, profile) }))
    .filter((r) => r.score >= MIN_MATCH)
    .sort((a, b) => b.score - a.score);
}

// 고른 취향 중 이 카메라와 일치하는 값들 (예: ['귀여움', '레트로'])
export function matchedLabels(model, profile) {
  return KEYS.filter((k) => profile[k] && model.taste?.[k] === profile[k]).map((k) => profile[k]);
}
