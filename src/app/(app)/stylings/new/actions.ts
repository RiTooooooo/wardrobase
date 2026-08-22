"use server";

import { registerStyling } from "@/application/styling/registerStyling";
import { requireWritableUserId } from "@/lib/actionSession";
import type { CreateStylingInput } from "@/schemas/styling";
import { createStylingSchema } from "@/schemas/styling";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

export async function createStylingAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireWritableUserId();

  if ("error" in session) return session.error;

  const parsed = createStylingSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "入力内容を確認してください" };
  }

  const data: CreateStylingInput = parsed.data;
  const id = await registerStyling(session.userId, data);

  if (id === null) {
    return { ok: false, message: "選択したアイテムが見つかりません" };
  }

  return { ok: true, id };
}
