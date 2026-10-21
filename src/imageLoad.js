// 사용자 사진 → 축소·회전 보정된 캔버스. 사진은 브라우저 밖으로 나가지 않는다.

const IMAGE_EXT = /\.(jpe?g|png)$/i;

export function fitWithin(width, height, maxEdge) {
  const longEdge = Math.max(width, height);
  if (longEdge <= maxEdge) return { width, height };
  const scale = maxEdge / longEdge;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

// 일부 안드로이드 파일 선택기는 실제 JPG인데도 type을 빈 문자열로 준다 → 확장자로 보완
export function isAcceptedImage(file) {
  if (!file) return false;
  if (file.type) return file.type.startsWith('image/');
  return IMAGE_EXT.test(file.name ?? '');
}

async function decodeWithBitmap(file) {
  return createImageBitmap(file, { imageOrientation: 'from-image' });
}

// createImageBitmap이 없는 구형 iOS(15 미만) 등을 위한 대체 경로. <img>는 EXIF 회전을 기본 반영한다.
function decodeWithImg(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode failed')); };
    img.src = url;
  });
}

export async function loadImageToCanvas(file, maxEdge = 1600) {
  if (!isAcceptedImage(file)) throw new Error('UNSUPPORTED_IMAGE');

  let image;
  try {
    image = typeof createImageBitmap === 'function' ? await decodeWithBitmap(file) : await decodeWithImg(file);
  } catch {
    try {
      image = await decodeWithImg(file);
    } catch {
      throw new Error('UNSUPPORTED_IMAGE');
    }
  }

  const srcW = image.naturalWidth || image.width;
  const srcH = image.naturalHeight || image.height;
  const { width, height } = fitWithin(srcW, srcH, maxEdge);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(image, 0, 0, width, height);
  image.close?.();
  return canvas;
}
