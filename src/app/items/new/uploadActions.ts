"use server";

import { randomUUID } from "node:crypto";

import { headers } from "next/headers";

import {
  buildObjectKey,
  createUploadUrl,
  isAllowedContentType,
} from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";

export type UploadUrlResult =
  | { ok: true; url: string; key: string }
  | { ok: false; message: string };

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function getUploadUrlAction(
  contentType: string,
  fileSize: number,
): Promise<UploadUrlResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    return { ok: false, message: "ログインが必要です" };
  }

  if (!isAllowedContentType(contentType)) {
    return { ok: false, message: "JPEG・PNG・WebP のみ対応しています" };
  }

  if (fileSize > MAX_FILE_SIZE) {
    return { ok: false, message: "ファイルサイズは10MB以下にしてください" };
  }

  const key = buildObjectKey(session.user.id, randomUUID(), contentType);
  const url = await createUploadUrl(key, contentType);

  return { ok: true, url, key };
}
