import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getBucket, getS3 } from "./client";

const UPLOAD_EXPIRES_IN = 300;

// 表示URLは署名時刻を1時間単位に丸めて生成する。presigned URL は署名時刻が
// 変わるとURL全体が変わり、ブラウザキャッシュが一切効かなくなるため。
// 有効期限は丸め幅の2倍にし、窓の末尾に署名されたURLでも1時間は有効に保つ。
const VIEW_SIGNING_WINDOW_MS = 3_600_000;
const VIEW_EXPIRES_IN = 7200;

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isAllowedContentType(contentType: string): boolean {
  return ALLOWED_CONTENT_TYPES.has(contentType);
}

export async function createUploadUrl(
  key: string,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(getS3(), command, { expiresIn: UPLOAD_EXPIRES_IN });
}

function viewSigningDate(now: number): Date {
  return new Date(
    Math.floor(now / VIEW_SIGNING_WINDOW_MS) * VIEW_SIGNING_WINDOW_MS,
  );
}

export async function createViewUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
    // 取得レスポンスに Cache-Control を付けさせ、ブラウザに再検証なしで
    // キャッシュさせる。URLは1時間ごとに変わるので max-age も1時間でよい
    ResponseCacheControl: "private, max-age=3600",
  });

  return getSignedUrl(getS3(), command, {
    expiresIn: VIEW_EXPIRES_IN,
    signingDate: viewSigningDate(Date.now()),
  });
}

export function buildObjectKey(
  userId: string,
  fileId: string,
  contentType: string,
): string {
  const ext = CONTENT_TYPE_TO_EXT[contentType] ?? "bin";
  return `${userId}/${fileId}.${ext}`;
}
