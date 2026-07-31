import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getBucket, getS3 } from "./client";

const UPLOAD_EXPIRES_IN = 300;
const VIEW_EXPIRES_IN = 3600;

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
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });

  return getSignedUrl(getS3(), command, { expiresIn: VIEW_EXPIRES_IN });
}

export function buildObjectKey(
  userId: string,
  fileId: string,
  contentType: string,
): string {
  const ext = CONTENT_TYPE_TO_EXT[contentType] ?? "bin";
  return `${userId}/${fileId}.${ext}`;
}
