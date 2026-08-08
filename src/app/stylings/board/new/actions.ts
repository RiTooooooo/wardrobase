"use server";

import { headers } from "next/headers";

import { registerStylingBoard } from "@/application/styling/registerStylingBoard";
import { auth } from "@/lib/auth";
import type { BoardStylingInput } from "@/schemas/styling";
import { boardStylingSchema } from "@/schemas/styling";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

export async function createStylingBoardAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    return { ok: false, message: "ログインが必要です" };
  }

  const parsed = boardStylingSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "入力内容を確認してください" };
  }

  const data: BoardStylingInput = parsed.data;
  const id = await registerStylingBoard(session.user.id, data);

  return { ok: true, id };
}
