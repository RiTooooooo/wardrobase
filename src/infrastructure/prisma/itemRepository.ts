import type { Item } from "@/generated/prisma/client";
import type {
  ItemUncheckedCreateInput,
  ItemUncheckedUpdateInput,
} from "@/generated/prisma/models";

import { prisma } from "./client";

/**
 * アイテムのリポジトリ。
 *
 * ## このファイルの最重要ルール（conventions.md §5）
 *
 * このプロジェクトの DB には RLS が無い。**「userId で絞り忘れる」＝「他人のデータが見える」**。
 * そのため、ここに置く関数はすべて以下を守る。
 *
 * 1. 第一引数に必ず `userId` を取る
 * 2. `findUnique({ where: { id } })` は使わない。必ず userId との複合条件で引く
 * 3. 更新・削除は `updateMany` / `deleteMany` を使い、`where` に userId を含める
 *    （「取得してから所有者チェック」は TOCTOU の余地があるため条件に含める方を優先）
 * 4. 取得時は `deletedAt: null` を条件に入れる（論理削除のため）
 *
 * `itemRepository.test.ts` がこの4点を機械的に検証している。
 */

/** 登録時にクライアントから受け取らない項目。userId はセッションから、id と日時は DB が決める */
export type CreateItemData = Omit<
  ItemUncheckedCreateInput,
  "id" | "userId" | "createdAt" | "deletedAt"
>;

/** 更新できない項目を除いたもの */
export type UpdateItemData = Omit<
  ItemUncheckedUpdateInput,
  "id" | "userId" | "createdAt" | "deletedAt"
>;

export async function findItemsByUser(userId: string): Promise<Item[]> {
  return prisma.item.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function findItemById(
  userId: string,
  id: string,
): Promise<Item | null> {
  // findUnique は使わない。id だけで引けてしまうため
  return prisma.item.findFirst({
    where: { id, userId, deletedAt: null },
  });
}

export async function createItem(
  userId: string,
  data: CreateItemData,
): Promise<Item> {
  return prisma.item.create({
    data: { ...data, userId },
  });
}

/**
 * 更新した件数を返す。0 なら「存在しない」か「他人のアイテム」。
 * どちらであるかは呼び出し側に伝えない（存在の有無を漏らさないため）。
 */
export async function updateItem(
  userId: string,
  id: string,
  data: UpdateItemData,
): Promise<number> {
  const result = await prisma.item.updateMany({
    where: { id, userId, deletedAt: null },
    data,
  });

  return result.count;
}

/** 論理削除。物理削除はしない */
export async function softDeleteItem(
  userId: string,
  id: string,
): Promise<number> {
  const result = await prisma.item.updateMany({
    where: { id, userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  return result.count;
}
