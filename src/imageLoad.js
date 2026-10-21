// 사용자 사진 → 축소·회전 보정된 캔버스. 사진은 브라우저 밖으로 나가지 않는다.

export function fitWithin(width, height, maxEdge) {
  const longEdge = Math.max(width, height);
  if (longEdge <= maxEdge) return { width, height };
  const scale = maxEdge / longEdge;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export async function loadImageToCanvas(file, maxEdge = 1600) {
  if (!file || !file.type.startsWith('image/')) throw new Error('UNSUPPORTED_IMAGE');

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('UNSUPPORTED_IMAGE');
  }

  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxEdge);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas;
}
