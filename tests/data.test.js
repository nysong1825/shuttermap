import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODELS, buildProductUrl } from '../src/data/models.js';

const RANGES = {
  brightness: [0.5, 1.5],
  contrast: [0.5, 1.5],
  saturation: [0, 2],
  warmth: [-1, 1],
  noise: [0, 1],
  vignette: [0, 1],
};

test('every model has id, name, huug.kr product URL, and numeric filter params in range', () => {
  assert.ok(MODELS.length > 0);
  for (const m of MODELS) {
    assert.match(m.id, /^[a-z0-9-]+$/, `id ${m.id}`);
    assert.ok(m.name, `name for ${m.id}`);
    assert.match(m.productUrl, /^https:\/\/huug\.kr\/product\/.+\/\d+\//, `url ${m.productUrl}`);
    for (const [key, [min, max]] of Object.entries(RANGES)) {
      const v = m.filter[key];
      assert.equal(typeof v, 'number', `${m.id}.${key}`);
      assert.ok(v >= min && v <= max, `${m.id}.${key}=${v}`);
    }
    assert.ok([null, 'yellow', 'white'].includes(m.filter.dateStamp), `${m.id}.dateStamp`);
  }
});

test('model ids are unique', () => {
  const ids = MODELS.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('buildProductUrl adds shuttermap UTM tags with model and source screen', () => {
  const model = { id: 'classic', productUrl: 'https://huug.kr/product/x/116/category/71/display/1/' };
  const url = new URL(buildProductUrl(model, 'sheet'));
  assert.equal(url.origin + url.pathname, 'https://huug.kr/product/x/116/category/71/display/1/');
  assert.equal(url.searchParams.get('utm_source'), 'shuttermap');
  assert.equal(url.searchParams.get('utm_medium'), 'app');
  assert.equal(url.searchParams.get('utm_campaign'), 'ax_hackathon_202610');
  assert.equal(url.searchParams.get('utm_content'), 'classic_sheet');
});

test('buildProductUrl keeps percent-encoded Korean slugs intact', () => {
  const raw = 'https://huug.kr/product/%ED%81%B4%EB%9E%98%EC%8B%9D/116/category/71/display/1/';
  const out = buildProductUrl({ id: 'classic', productUrl: raw }, 'convert');
  assert.ok(out.startsWith(raw + '?utm_source=shuttermap'), out);
});
