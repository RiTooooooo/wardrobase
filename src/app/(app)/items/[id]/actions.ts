"use server";

import { headers } from "next/headers";

import { updateItemUseCase } from "@/application/item/updateItem";
import { softDeleteItem } from "@/infrastructure/prisma/itemRepository";
import { auth } from "@/lib/auth";
import type { CreateItemInput } from "@/schemas/item";
import { createItemSchema } from "@/schemas/item";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

async function requireSession(): Promise<
  { userId: string } | { error: ActionResult }
> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    return { error: { ok: false, message: "ログインが必要です" } };
  }

  return { userId: session.user.id };
}

function isOwnedImage(path: string | undefined, userId: string): boolean {
  return path === undefined || path.startsWith(`${userId}/`);
}

export async function updateItemAction(
  itemId: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await requireSession();
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
  const session = await requireSession();
  if ("error" in session) return session.error;

  const count = await softDeleteItem(session.userId, itemId);

  return count === 0
    ? { ok: false, message: "アイテムが見つかりません" }
    : { ok: true, id: itemId };
}
