// 작례 사진 폴더(모델명/장소_번호.jpg) → src/data/pins.js 생성.
// 사용법: node scripts/build-pins.mjs [사진 폴더=assets/photos]

import { readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const FILE_RULE = /^(.+)_(\d+)\.(jpe?g|png)$/i;
const PHOTO_EXT = /\.(jpe?g|png)$/i;
const OFFSET_DEG = 0.00035;  // 같은 장소 핀 간 거리(위도 기준 약 40m)
const LNG_SCALE = 1.26;      // 서울 위도에서 경도 1도가 더 짧은 것을 보정
const GOLDEN_ANGLE = 2.39996;

const round6 = (n) => Math.round(n * 1e6) / 1e6;

export function buildPins(files, places, models, { basePath = 'assets/photos/', onWarn = console.warn } = {}) {
  const byName = new Map(models.map((m) => [m.name.normalize('NFC'), m]));
  const countPerPlace = new Map();
  const pins = [];

  for (const raw of files) {
    const file = raw.normalize('NFC').replaceAll('\\', '/');
    const parts = file.split('/');
    if (parts.length !== 2 && parts.length !== 3) { onWarn(`규칙 위반(모델 폴더 아님): ${file}`); continue; }
    const folder = parts[0];
    const name = parts[parts.length - 1];

    const model = byName.get(folder);
    if (!model) { onWarn(`모르는 모델 폴더: ${file}`); continue; }

    // 두 가지 정리 방식을 받는다: 모델/장소_번호.jpg 또는 모델/장소/아무이름.jpg
    let place, num;
    if (parts.length === 3) {
      if (!PHOTO_EXT.test(name)) { onWarn(`사진 파일 아님(jpg/png): ${file}`); continue; }
      place = parts[1];
      num = name.replace(PHOTO_EXT, '');
    } else {
      const match = FILE_RULE.exec(name);
      if (!match) { onWarn(`파일명 규칙 위반(장소_번호.jpg): ${file}`); continue; }
      [, place, num] = match;
    }

    const center = places[place];
    if (!center) { onWarn(`장소 좌표 없음(places.js에 추가 필요): ${place} — ${file}`); continue; }

    const k = countPerPlace.get(place) ?? 0;
    countPerPlace.set(place, k + 1);
    const angle = k * GOLDEN_ANGLE;
    const r = k === 0 ? 0 : OFFSET_DEG;

    pins.push({
      id: `${model.id}-${place}-${num}`,
      place,
      lat: round6(center.lat + r * Math.sin(angle)),
      lng: round6(center.lng + r * LNG_SCALE * Math.cos(angle)),
      model: model.id,
      photo: basePath + parts.map(encodeURIComponent).join('/'),
      caption: `${place}에서 ${model.name}로 찍은 사진`,
    });
  }
  return pins;
}

function listFiles(dir, depth = 0, root = dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && depth < 2) out.push(...listFiles(full, depth + 1, root));
    else if (entry.isFile()) out.push(relative(root, full));
  }
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const photoDir = process.argv[2] ?? 'assets/photos';
  const { PLACES } = await import(pathToFileURL(join(root, 'src/data/places.js')).href);
  const { MODELS } = await import(pathToFileURL(join(root, 'src/data/models.js')).href);

  const basePath = photoDir.replaceAll('\\', '/').replace(/\/?$/, '/');
  const pins = buildPins(listFiles(join(root, photoDir)), PLACES, MODELS, { basePath });
  const body = `// scripts/build-pins.mjs가 생성한 파일 — 직접 수정하지 말 것.\nexport const PINS = ${JSON.stringify(pins, null, 2)};\n`;
  writeFileSync(join(root, 'src/data/pins.js'), body);
  console.log(`핀 ${pins.length}개 생성 → src/data/pins.js`);
}
