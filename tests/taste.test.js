import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODELS } from '../src/data/models.js';
import { matchModels, tasteScore } from '../src/taste.js';

const ids = (profile) => matchModels(MODELS, profile).map((r) => r.id);

test('every model has a taste from the onboarding vocabulary', () => {
  for (const m of MODELS) {
    assert.ok(['귀여움', '클래식', '메탈릭'].includes(m.taste.design), `${m.id}.design`);
    assert.ok(['레트로', '선명함', '쨍한색감'].includes(m.taste.look), `${m.id}.look`);
    assert.ok(['가성비', '고기능'].includes(m.taste.price), `${m.id}.price`);
  }
});

test('shows models matching 2 or more of the 3 picks, best first', () => {
  const profile = { design: '귀여움', look: '레트로', price: '가성비' };
  const result = matchModels(MODELS, profile);
  assert.deepEqual(result.filter((r) => r.score === 3).map((r) => r.id).sort(), ['flip', 'retro-digi']);
  assert.equal(result[0].score, 3);
  assert.ok(result.every((r) => r.score >= 2));
});

test('models matching only 1 pick are hidden', () => {
  assert.equal(tasteScore(MODELS.find((m) => m.id === 'classic'), { design: '귀여움', look: '선명함', price: '가성비' }), 0);
  assert.ok(!ids({ design: '클래식', look: '선명함', price: '가성비' }).includes('flip270'));
});

test('neo shows up for 귀여움 (with a second match)', () => {
  assert.ok(ids({ design: '귀여움', look: '쨍한색감', price: '고기능' }).includes('neo'));
});

test('every possible pick combination shows at least one model', () => {
  for (const design of ['귀여움', '클래식', '메탈릭'])
    for (const look of ['레트로', '선명함', '쨍한색감'])
      for (const price of ['가성비', '고기능'])
        assert.ok(ids({ design, look, price }).length > 0, `${design}/${look}/${price}`);
});
