import type { prisma } from "./client";

/**
 * コーデ・スタイリングへアイテムを紐付ける前の所有チェック。
 *
 * RLS が無いため、クライアントから渡された itemId に他人のものが
 * 混ざっていても DB は止めてくれない。紐付けと同一トランザクション内で
 * 「全て本人のアイテムか」を件数で検証する（conventions.md §5）。
 */

export type TransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

export async function ownsAllItems(
  tx: TransactionClient,
  userId: string,
  itemIds: string[],
): Promise<boolean> {
  const uniqueIds = [...new Set(itemIds)];

  const count = await tx.item.count({
    where: { id: { in: uniqueIds }, userId, deletedAt: null },
  });

  return count === uniqueIds.length;
}
