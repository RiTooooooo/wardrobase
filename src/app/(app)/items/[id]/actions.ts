"use server";

import { updateItemUseCase } from "@/application/item/updateItem";
import { softDeleteItem } from "@/infrastructure/prisma/itemRepository";
import { requireWritableUserId } from "@/lib/actionSession";
import type { CreateItemInput } from "@/schemas/item";
import { createItemSchema } from "@/schemas/item";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

function isOwnedImage(path: string | undefined, userId: string): boolean {
  return path === undefined || path.startsWith(`${userId}/`);
}

export async function updateItemAction(
  itemId: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await requireWritableUserId();
  if ("error" in session) return session.error;

  const parsed = createItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "入力内容を確認してください" };
  }

  const data: CreateItemInput = parsed.data;

  if (!isOwnedImage(data.imagePath, session.userId)) {
    return { ok: false, message: "不正な画像パスです" };
  }

  const count = await updateItemUseCase(session.userId, itemId, data);

  return count === 0
    ? { ok: false, message: "アイテムが見つかりません" }
    : { ok: true, id: itemId };
}

export async function deleteItemAction(
  itemId: string,
): Promise<ActionResult> {
  const session = await requireWritableUserId();
  if ("error" in session) return session.error;

  const count = await softDeleteItem(session.userId, itemId);

  return count === 0
    ? { ok: false, message: "アイテムが見つかりません" }
    : { ok: true, id: itemId };
}
