"use server";

import { headers } from "next/headers";

import { registerItem } from "@/application/item/registerItem";
import { auth } from "@/lib/auth";
import { createItemSchema } from "@/schemas/item";

export type CreateItemResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

/**
 * アイテム登録。
 *
 * Server Function は UI を経由せず直接 POST で叩けるため、
 * 冒頭でセッションを確認し、クライアントの検証も信用しない（conventions.md §5）。
 */
export async function createItemAction(
  input: unknown,
): Promise<CreateItemResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    return { ok: false, message: "ログインが必要です" };
  }

  const parsed = createItemSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "入力内容を確認してください" };
  }

  const { imagePath } = parsed.data;
  if (imagePath !== undefined && !imagePath.startsWith(`${session.user.id}/`)) {
    return { ok: false, message: "不正な画像パスです" };
  }

  const id = await registerItem(session.user.id, parsed.data);

  return { ok: true, id };
}
