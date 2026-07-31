const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.85;
const WEBP_QUALITY = 0.85;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ResizedImage = {
  blob: Blob;
  contentType: string;
};

export function isAllowedImageType(file: File): boolean {
  return ALLOWED_TYPES.has(file.type);
}

function getOutputQuality(type: string): number | undefined {
  if (type === "image/png") {
    return undefined;
  }
  if (type === "image/webp") {
    return WEBP_QUALITY;
  }
  return JPEG_QUALITY;
}

function calcTargetSize(
  width: number,
  height: number,
): { width: number; height: number } {
  if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
    return { width, height };
  }

  const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

export async function resizeImage(file: File): Promise<ResizedImage> {
  const bitmap = await createImageBitmap(file);
  const target = calcTargetSize(bitmap.width, bitmap.height);

  const canvas = new OffscreenCanvas(target.width, target.height);
  const ctx = canvas.getContext("2d");

  if (ctx === null) {
    throw new Error("Canvas context の取得に失敗しました");
  }

  ctx.drawImage(bitmap, 0, 0, target.width, target.height);
  bitmap.close();

  const outputType = file.type;
  const quality = getOutputQuality(outputType);
  const blob = await canvas.convertToBlob({ type: outputType, quality });

  return { blob, contentType: outputType };
}
