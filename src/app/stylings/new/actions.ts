"use server";

import { headers } from "next/headers";

import { registerStyling } from "@/application/styling/registerStyling";
import { auth } from "@/lib/auth";
import type { CreateStylingInput } from "@/schemas/styling";
import { createStylingSchema } from "@/schemas/styling";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

export async function createStylingAction(
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
  const id = await registerStyling(session.user.id, data);

  return { ok: true, id };
}
