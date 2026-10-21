import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPins } from '../scripts/build-pins.mjs';

const PLACES = { 성수동: { lat: 37.5446, lng: 127.0559 }, 연남동: { lat: 37.5662, lng: 126.9254 } };
const MODELS = [{ id: 'retro-flip', name: '레트로 플립 디카' }, { id: 'classic', name: '클래식 디카' }];

function run(files) {
  const warnings = [];
  const pins = buildPins(files, PLACES, MODELS, { basePath: 'assets/photos/', onWarn: (w) => warnings.push(w) });
  return { pins, warnings };
}

test('parses model/place_number.jpg into a pin', () => {
  const { pins, warnings } = run(['레트로 플립 디카/성수동_01.jpg']);
  assert.equal(warnings.length, 0);
  assert.equal(pins.length, 1);
  const p = pins[0];
  assert.equal(p.model, 'retro-flip');
  assert.equal(p.place, '성수동');
  assert.equal(p.lat, 37.5446);
  assert.equal(p.lng, 127.0559);
  assert.equal(p.photo, `assets/photos/${encodeURIComponent('레트로 플립 디카')}/${encodeURIComponent('성수동_01.jpg')}`);
  assert.ok(p.id && p.caption);
});

test('skips files that do not match the naming rule', () => {
  const { pins, warnings } = run(['레트로 플립 디카/IMG00062.jpg', '레트로 플립 디카/성수동.jpg', '성수동_01.jpg', '레트로 플립 디카/성수동_01.txt']);
  assert.equal(pins.length, 0);
  assert.equal(warnings.length, 4);
});

test('skips places missing from PLACES and reports them', () => {
  const { pins, warnings } = run(['클래식 디카/부산_01.jpg', '클래식 디카/연남동_01.JPG']);
  assert.equal(pins.length, 1);
  assert.equal(pins[0].place, '연남동');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /부산/);
});

test('unknown model folder is skipped', () => {
  const { pins, warnings } = run(['없는 카메라/성수동_01.jpg']);
  assert.equal(pins.length, 0);
  assert.equal(warnings.length, 1);
});

test('offsets pins in the same place deterministically and not identical', () => {
  const files = ['레트로 플립 디카/성수동_01.jpg', '클래식 디카/성수동_01.jpg', '클래식 디카/성수동_02.png'];
  const a = run(files).pins;
  const b = run(files).pins;
  assert.deepEqual(a, b);
  const coords = new Set(a.map((p) => `${p.lat},${p.lng}`));
  assert.equal(coords.size, 3);
  for (const p of a) {
    const meters = Math.hypot((p.lat - 37.5446) * 111000, (p.lng - 127.0559) * 88000);
    assert.ok(meters <= 80, `${meters}m from center`);
  }
});

test('pin ids are unique', () => {
  const { pins } = run(['레트로 플립 디카/성수동_01.jpg', '클래식 디카/성수동_01.jpg']);
  assert.equal(new Set(pins.map((p) => p.id)).size, 2);
});
