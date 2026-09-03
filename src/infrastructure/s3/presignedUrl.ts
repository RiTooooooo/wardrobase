import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getBucket, getS3 } from "./client";

const UPLOAD_EXPIRES_IN = 300;

/*
 * 閲覧用 URL はブラウザキャッシュを効かせるため、リクエストごとに作り直さない。
 *
 * presigned URL は署名時刻（X-Amz-Date）が変わると URL 全体が変わり、
 * ブラウザから見て毎回「別の画像」になってキャッシュが全滅する。
 * そこで署名時刻を1時間単位に切り捨てて固定し、同じ1時間の間は
 * どのサーバーインスタンスで生成しても同一の URL になるようにする。
 *
 * 有効期限は「時間バケット開始から2時間」。バケットの終わり際に発行された
 * URL でも最低1時間の有効期間が残る計算になる。
 */
const VIEW_URL_BUCKET_MS = 60 * 60 * 1000;
const VIEW_EXPIRES_IN = 2 * 60 * 60;

/*
 * S3 のレスポンスに付ける Cache-Control（署名に含まれるクエリで指定する）。
 * オブジェクトキーは UUID で内容が変わることがないため immutable。
 * private なのは presigned URL 経由の私物画像を共有キャッシュに置かないため。
 */
const VIEW_RESPONSE_CACHE_CONTROL = "private, max-age=86400, immutable";

/* 同一バケット時間内の再署名を省くプロセス内キャッシュ。バケットが変わったら破棄 */
const viewUrlCache = new Map<string, string>();
let viewUrlCacheBucket = 0;

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

export async function createViewUrl(key: string): Promise<string> {
  const bucketStart =
    Math.floor(Date.now() / VIEW_URL_BUCKET_MS) * VIEW_URL_BUCKET_MS;

  if (bucketStart !== viewUrlCacheBucket) {
    viewUrlCache.clear();
    viewUrlCacheBucket = bucketStart;
  }

  const cached = viewUrlCache.get(key);
  if (cached !== undefined) return cached;

  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ResponseCacheControl: VIEW_RESPONSE_CACHE_CONTROL,
  });

  const url = await getSignedUrl(getS3(), command, {
    expiresIn: VIEW_EXPIRES_IN,
    signingDate: new Date(bucketStart),
  });

  viewUrlCache.set(key, url);

  return url;
}

export function buildObjectKey(
  userId: string,
  fileId: string,
  contentType: string,
): string {
  const ext = CONTENT_TYPE_TO_EXT[contentType] ?? "bin";
  return `${userId}/${fileId}.${ext}`;
}
