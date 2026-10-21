import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyFilter } from '../src/filters.js';

const NEUTRAL = { brightness: 1, contrast: 1, saturation: 1, warmth: 0, noise: 0, vignette: 0, dateStamp: false };

function solid(w, h, [r, g, b]) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
  }
  return data;
}

test('identity params leaves pixels unchanged', () => {
  const data = new Uint8ClampedArray([10, 120, 240, 255, 200, 50, 90, 255]);
  const before = Array.from(data);
  applyFilter(data, 2, 1, NEUTRAL);
  assert.deepEqual(Array.from(data), before);
});

test('brightness 1.2 raises mid-gray', () => {
  const data = solid(1, 1, [100, 100, 100]);
  applyFilter(data, 1, 1, { ...NEUTRAL, brightness: 1.2 });
  assert.ok(data[0] >= 120 && data[0] <= 255, `got ${data[0]}`);
});

test('warmth +0.5 raises red and lowers blue', () => {
  const data = solid(1, 1, [100, 100, 100]);
  applyFilter(data, 1, 1, { ...NEUTRAL, warmth: 0.5 });
  assert.ok(data[0] > 100, `red ${data[0]}`);
  assert.ok(data[2] < 100, `blue ${data[2]}`);
});

test('saturation 0 produces gray', () => {
  const data = solid(1, 1, [200, 40, 90]);
  applyFilter(data, 1, 1, { ...NEUTRAL, saturation: 0 });
  assert.equal(data[0], data[1]);
  assert.equal(data[1], data[2]);
});

test('same seed gives same noise, different seed differs', () => {
  const a = solid(8, 8, [128, 128, 128]);
  const b = solid(8, 8, [128, 128, 128]);
  const c = solid(8, 8, [128, 128, 128]);
  applyFilter(a, 8, 8, { ...NEUTRAL, noise: 0.5 }, 1);
  applyFilter(b, 8, 8, { ...NEUTRAL, noise: 0.5 }, 1);
  applyFilter(c, 8, 8, { ...NEUTRAL, noise: 0.5 }, 2);
  assert.deepEqual(Array.from(a), Array.from(b));
  assert.notDeepEqual(Array.from(a), Array.from(c));
});

test('vignette darkens corners more than center', () => {
  const data = solid(4, 4, [255, 255, 255]);
  applyFilter(data, 4, 4, { ...NEUTRAL, vignette: 1 });
  const corner = data[0];
  const center = data[(1 * 4 + 1) * 4];
  assert.ok(corner < center, `corner ${corner} center ${center}`);
});

test('alpha channel is never changed', () => {
  const data = new Uint8ClampedArray([100, 100, 100, 77]);
  applyFilter(data, 1, 1, { ...NEUTRAL, brightness: 1.5, noise: 1, vignette: 1 }, 3);
  assert.equal(data[3], 77);
});

import { fitWithin } from '../src/imageLoad.js';

test('fitWithin shrinks 4000x3000 to 1600x1200', () => {
  assert.deepEqual(fitWithin(4000, 3000, 1600), { width: 1600, height: 1200 });
});

test('fitWithin keeps 800x600', () => {
  assert.deepEqual(fitWithin(800, 600, 1600), { width: 800, height: 600 });
});

test('fitWithin shrinks portrait 3000x4000 to 1200x1600', () => {
  assert.deepEqual(fitWithin(3000, 4000, 1600), { width: 1200, height: 1600 });
});

import { isAcceptedImage } from '../src/imageLoad.js';

test('isAcceptedImage accepts jpg/png by type, and by extension when type is empty', () => {
  assert.equal(isAcceptedImage({ type: 'image/jpeg', name: 'a.jpg' }), true);
  assert.equal(isAcceptedImage({ type: 'image/png', name: 'a.png' }), true);
  assert.equal(isAcceptedImage({ type: '', name: 'IMG_0001.JPG' }), true);
  assert.equal(isAcceptedImage({ type: '', name: 'photo.jpeg' }), true);
  assert.equal(isAcceptedImage({ type: '', name: 'notes.txt' }), false);
  assert.equal(isAcceptedImage({ type: 'text/plain', name: 'a.txt' }), false);
  assert.equal(isAcceptedImage(null), false);
});
