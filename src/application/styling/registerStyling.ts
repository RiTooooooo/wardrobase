import { createStyling } from "@/infrastructure/prisma/stylingRepository";
import type { CreateStylingInput } from "@/schemas/styling";

export async function registerStyling(
  userId: string,
  input: CreateStylingInput,
): Promise<string> {
  const styling = await createStyling(userId, {
    name: input.name,
    itemIds: input.itemIds,
    seasons: input.seasons,
    memo: input.memo,
  });

  return styling.id;
}
