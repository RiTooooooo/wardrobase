"use server";

import { registerItem } from "@/application/item/registerItem";
import { requireWritableUserId } from "@/lib/actionSession";
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
  const session = await requireWritableUserId();

  if ("error" in session) return session.error;

  const parsed = createItemSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "入力内容を確認してください" };
  }

  const { imagePath } = parsed.data;
  if (imagePath !== undefined && !imagePath.startsWith(`${session.userId}/`)) {
    return { ok: false, message: "不正な画像パスです" };
  }

  const id = await registerItem(session.userId, parsed.data);

  return { ok: true, id };
}
