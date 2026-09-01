"use server";

import { softDeleteStyling } from "@/infrastructure/prisma/stylingRepository";
import { requireWritableUserId } from "@/lib/actionSession";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

export async function deleteStylingAction(
  stylingId: string,
): Promise<ActionResult> {
  const session = await requireWritableUserId();

  if ("error" in session) return session.error;

  const count = await softDeleteStyling(session.userId, stylingId);

  return count === 0
    ? { ok: false, message: "スタイリングが見つかりません" }
    : { ok: true, id: stylingId };
}
