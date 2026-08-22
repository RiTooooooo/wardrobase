"use server";

import { registerOutfit } from "@/application/outfit/registerOutfit";
import { requireWritableUserId } from "@/lib/actionSession";
import type { CreateOutfitInput } from "@/schemas/outfit";
import { createOutfitSchema } from "@/schemas/outfit";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

export async function createOutfitAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireWritableUserId();

  if ("error" in session) return session.error;

  const parsed = createOutfitSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "入力内容を確認してください" };
  }

  const data: CreateOutfitInput = parsed.data;
  const id = await registerOutfit(session.userId, data);

  if (id === null) {
    return { ok: false, message: "選択したアイテムが見つかりません" };
  }

  return { ok: true, id };
}
