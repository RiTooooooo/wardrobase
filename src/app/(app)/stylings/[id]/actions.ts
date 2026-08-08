"use server";

import { headers } from "next/headers";

import { updateStylingUseCase } from "@/application/styling/updateStylingUseCase";
import { softDeleteStyling } from "@/infrastructure/prisma/stylingRepository";
import { auth } from "@/lib/auth";
import type { CreateStylingInput } from "@/schemas/styling";
import { createStylingSchema } from "@/schemas/styling";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

export async function updateStylingAction(
  stylingId: string,
  input: unknown,
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    return { ok: false, message: "ログインが必要です" };
  }

  const parsed = createStylingSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "入力内容を確認してください" };
  }

  const data: CreateStylingInput = parsed.data;
  const count = await updateStylingUseCase(
    session.user.id,
    stylingId,
    data,
  );

  return count === 0
    ? { ok: false, message: "スタイリングが見つかりません" }
    : { ok: true, id: stylingId };
}

export async function deleteStylingAction(
  stylingId: string,
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    return { ok: false, message: "ログインが必要です" };
  }

  const count = await softDeleteStyling(session.user.id, stylingId);

  return count === 0
    ? { ok: false, message: "スタイリングが見つかりません" }
    : { ok: true, id: stylingId };
}
