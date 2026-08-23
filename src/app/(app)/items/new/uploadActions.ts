"use server";

import { randomUUID } from "node:crypto";

import {
  buildObjectKey,
  createUploadUrl,
  isAllowedContentType,
} from "@/infrastructure/s3/presignedUrl";
import { requireWritableUserId } from "@/lib/actionSession";

export type UploadUrlResult =
  | { ok: true; url: string; key: string }
  | { ok: false; message: string };

// Supabase Storage のバケット側制限（5MB）と揃える
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// NaN・負数・Infinity の申告を弾く。なお申告値と実ファイルの一致は
// ここでは保証できないため、実サイズはバケット側の5MB制限が最終防衛線
function isValidFileSize(fileSize: number): boolean {
  return Number.isFinite(fileSize) && fileSize > 0 && fileSize <= MAX_FILE_SIZE;
}

export async function getUploadUrlAction(
  contentType: string,
  fileSize: number,
): Promise<UploadUrlResult> {
  const session = await requireWritableUserId();

  if ("error" in session) return session.error;

  if (!isAllowedContentType(contentType)) {
    return { ok: false, message: "JPEG・PNG・WebP のみ対応しています" };
  }

  if (!isValidFileSize(fileSize)) {
    return { ok: false, message: "ファイルサイズは5MB以下にしてください" };
  }

  const key = buildObjectKey(session.userId, randomUUID(), contentType);
  const url = await createUploadUrl(key, contentType);

  return { ok: true, url, key };
}
