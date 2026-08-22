"use server";

import { registerStylingBoard } from "@/application/styling/registerStylingBoard";
import { requireWritableUserId } from "@/lib/actionSession";
import type { BoardStylingInput } from "@/schemas/styling";
import { boardStylingSchema } from "@/schemas/styling";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

export async function createStylingBoardAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await requireWritableUserId();

  if ("error" in session) return session.error;

  const parsed = boardStylingSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "入力内容を確認してください" };
  }

  const data: BoardStylingInput = parsed.data;
  const id = await registerStylingBoard(session.userId, data);

  if (id === null) {
    return { ok: false, message: "選択したアイテムが見つかりません" };
  }

  return { ok: true, id };
}
