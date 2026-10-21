// 픽셀 필터 엔진. RGBA 배열을 제자리에서 수정하는 순수 함수라 브라우저 없이 테스트할 수 있다.

const WARMTH_SHIFT = 40;   // warmth 1.0일 때 R+/B- 이동량
const NOISE_AMPLITUDE = 60; // noise 1.0일 때 최대 흔들림 폭
const VIGNETTE_STRENGTH = 0.6;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function applyFilter(data, width, height, params, seed = 1) {
  const { brightness, contrast, saturation, warmth, noise, vignette } = params;
  const rand = noise > 0 ? mulberry32(seed) : null;
  const cx = width / 2;
  const cy = height / 2;
  const maxDist = Math.hypot(cx, cy) || 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      let r = data[i], g = data[i + 1], b = data[i + 2];

      if (brightness !== 1) { r *= brightness; g *= brightness; b *= brightness; }

      if (contrast !== 1) {
        r = (r - 128) * contrast + 128;
        g = (g - 128) * contrast + 128;
        b = (b - 128) * contrast + 128;
      }

      if (saturation !== 1) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * saturation;
        g = gray + (g - gray) * saturation;
        b = gray + (b - gray) * saturation;
      }

      if (warmth !== 0) { r += warmth * WARMTH_SHIFT; b -= warmth * WARMTH_SHIFT; }

      if (vignette > 0) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / maxDist;
        const f = 1 - vignette * VIGNETTE_STRENGTH * d * d;
        r *= f; g *= f; b *= f;
      }

      if (rand) {
        const n = (rand() - 0.5) * noise * NOISE_AMPLITUDE;
        r += n; g += n; b += n;
      }

      data[i] = r; data[i + 1] = g; data[i + 2] = b; // Uint8ClampedArray가 0~255로 클램프·반올림
    }
  }
}
