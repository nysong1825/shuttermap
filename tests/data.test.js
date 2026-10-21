import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODELS } from '../src/data/models.js';

const RANGES = {
  brightness: [0.5, 1.5],
  contrast: [0.5, 1.5],
  saturation: [0, 2],
  warmth: [-1, 1],
  noise: [0, 1],
  vignette: [0, 1],
};

test('every model has id, name, https://huug.kr productUrl, and numeric filter params in range', () => {
  assert.ok(MODELS.length > 0);
  for (const m of MODELS) {
    assert.match(m.id, /^[a-z0-9-]+$/, `id ${m.id}`);
    assert.ok(m.name, `name for ${m.id}`);
    assert.ok(m.productUrl.startsWith('https://huug.kr'), `url ${m.productUrl}`);
    for (const [key, [min, max]] of Object.entries(RANGES)) {
      const v = m.filter[key];
      assert.equal(typeof v, 'number', `${m.id}.${key}`);
      assert.ok(v >= min && v <= max, `${m.id}.${key}=${v}`);
    }
    assert.equal(typeof m.filter.dateStamp, 'boolean', `${m.id}.dateStamp`);
  }
});

test('model ids are unique', () => {
  const ids = MODELS.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
});
