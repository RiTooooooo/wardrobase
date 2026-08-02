"use server";

import { headers } from "next/headers";

import { registerOutfit } from "@/application/outfit/registerOutfit";
import { auth } from "@/lib/auth";
import type { CreateOutfitInput } from "@/schemas/outfit";
import { createOutfitSchema } from "@/schemas/outfit";

type ActionResult = { ok: true; id: string } | { ok: false; message: string };

export async function createOutfitAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    return { ok: false, message: "ログインが必要です" };
  }

  const parsed = createOutfitSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: "入力内容を確認してください" };
  }

  const data: CreateOutfitInput = parsed.data;
  const id = await registerOutfit(session.user.id, data);

  return { ok: true, id };
}
