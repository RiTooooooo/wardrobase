import type { Item, Outfit } from "@/generated/prisma/client";

import { prisma } from "./client";
import { ownsAllItems } from "./itemOwnership";
import type { TransactionClient } from "./itemOwnership";

export type OutfitWithItems = Outfit & {
  items: Array<{ itemId: string; item: Item }>;
};

export type CreateOutfitData = {
  wornOn: Date;
  itemIds: string[];
  satisfaction?: number;
  weather?: string;
  memo?: string;
};

const INCLUDE_ITEMS = {
  items: { include: { item: true } },
} as const;

export async function findOutfitsByUser(
  userId: string,
): Promise<OutfitWithItems[]> {
  return prisma.outfit.findMany({
    where: { userId, deletedAt: null },
    orderBy: { wornOn: "desc" },
    include: INCLUDE_ITEMS,
  });
}

export async function findOutfitById(
  userId: string,
  id: string,
): Promise<OutfitWithItems | null> {
  return prisma.outfit.findFirst({
    where: { id, userId, deletedAt: null },
    include: INCLUDE_ITEMS,
  });
}

function toOutfitScalars(data: CreateOutfitData): {
  wornOn: Date;
  satisfaction: number | null;
  weather: string | null;
  memo: string | null;
} {
  return {
    wornOn: data.wornOn,
    satisfaction: data.satisfaction ?? null,
    weather: data.weather ?? null,
    memo: data.memo ?? null,
  };
}

/** 他人のアイテムが混ざっていた場合は作成せず null を返す */
export async function createOutfit(
  userId: string,
  data: CreateOutfitData,
): Promise<Outfit | null> {
  return prisma.$transaction(async (tx) => {
    if (!(await ownsAllItems(tx, userId, data.itemIds))) return null;

    const outfit = await tx.outfit.create({
      data: {
        userId,
        ...toOutfitScalars(data),
        items: {
          create: data.itemIds.map((itemId) => ({ itemId })),
        },
      },
    });

    await createWearLogs(tx, userId, outfit.id, data.itemIds, data.wornOn);

    return outfit;
  });
}

export async function updateOutfit(
  userId: string,
  id: string,
  data: CreateOutfitData,
): Promise<number> {
  return prisma.$transaction(async (tx) => {
    if (!(await ownsAllItems(tx, userId, data.itemIds))) return 0;

    const result = await tx.outfit.updateMany({
      where: { id, userId, deletedAt: null },
      data: toOutfitScalars(data),
    });

    if (result.count === 0) return 0;

    await tx.outfitItem.deleteMany({ where: { outfitId: id } });
    await tx.outfitItem.createMany({
      data: data.itemIds.map((itemId) => ({ outfitId: id, itemId })),
    });

    await tx.wearLog.deleteMany({ where: { outfitId: id } });
    await createWearLogs(tx, userId, id, data.itemIds, data.wornOn);

    return result.count;
  });
}

export async function softDeleteOutfit(
  userId: string,
  id: string,
): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const result = await tx.outfit.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    if (result.count > 0) {
      await tx.wearLog.deleteMany({ where: { outfitId: id } });
    }

    return result.count;
  });
}

async function createWearLogs(
  tx: TransactionClient,
  userId: string,
  outfitId: string,
  itemIds: string[],
  wornOn: Date,
): Promise<void> {
  for (const itemId of itemIds) {
    await tx.wearLog.upsert({
      where: { itemId_wornOn: { itemId, wornOn } },
      create: { userId, itemId, wornOn, outfitId },
      update: {},
    });
  }
}
