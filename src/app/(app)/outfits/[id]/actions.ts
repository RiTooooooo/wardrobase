"use server";

import { updateOutfitUseCase } from "@/application/outfit/updateOutfitUseCase";
import { softDeleteOutfit } from "@/infrastructure/prisma/outfitRepository";
import { requireWritableUserId } from "@/lib/actionSession";
import type { CreateOutfitInput } from "@/schemas/outfit";
import { createOutfitSchema } from "@/schemas/outfit";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

export async function updateOutfitAction(
  outfitId: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await requireWritableUserId();

  if ("error" in session) return session.error;

  const parsed = createOutfitSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "入力内容を確認してください" };
  }

  const data: CreateOutfitInput = parsed.data;
  const count = await updateOutfitUseCase(
    session.userId,
    outfitId,
    data,
  );

  return count === 0
    ? { ok: false, message: "コーデが見つかりません" }
    : { ok: true, id: outfitId };
}

export async function deleteOutfitAction(
  outfitId: string,
): Promise<ActionResult> {
  const session = await requireWritableUserId();

  if ("error" in session) return session.error;

  const count = await softDeleteOutfit(session.userId, outfitId);

  return count === 0
    ? { ok: false, message: "コーデが見つかりません" }
    : { ok: true, id: outfitId };
}
